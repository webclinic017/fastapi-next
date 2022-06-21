import { ISessionStore } from "./ISessionStore";
import redis, { createClient, RedisClientType } from 'redis';
import { RedisClientOptions } from '@redis/client'
import { NextHealthCheckStatus } from "../config/NextOptions";

const noop = () => { };

export interface RedisOptions {
    host: string;
    password?: string;
    port?: number;
    ttl?: number;
}

export class RedisSessionStore extends ISessionStore {

    public client: RedisClientType<any, any, redis.RedisScripts>;
    private isAlive = false;
    constructor(public config: RedisClientOptions<any, any>, public ttl: number = 30 * 60) {
        super();
        this.init = this.init.bind(this);
        this.handleError = this.handleError.bind(this);
        var client = createClient(config);
        client.on('error', (err) => {
            this.handleError(err);
        });
        client.on('connection', () => {
            this.isAlive = true;
        });
        this.client = client;
    }
    async healthCheck(): Promise<NextHealthCheckStatus> {
        return this.isAlive ? NextHealthCheckStatus.Alive() : NextHealthCheckStatus.Dead();
    }
    private handleError(err: any) {
        const errorMessage = (err || "").toString().toLowerCase();
        // if noauth error or no connection error or client is closed, reconnect
        if (errorMessage.includes("noauth") || errorMessage.includes("econnrefused") || errorMessage.includes("closed")) {
            console.warn("Redis session store error:", errorMessage);
            console.log("Trying to reconnect...");
            this.isAlive = false;
            this.client.disconnect().finally(() => {
                this.client.connect().then(() => {
                    console.log('Reconnected to Redis');
                    this.isAlive = true;
                }).catch((err) => {
                    console.error("Error reconnecting to Redis:", err);
                    setTimeout(this.handleError.bind(this, err), 1000);
                });
            });
        }
        else {
            console.error(err);
        }

    }
    public get(sid: any, cb?: any): void {
        this.client.get(sid).then((result) => {
            try {
                if (cb) cb(null, JSON.parse(result));
            } catch (err) {
                if (cb) cb(err);
            }
            this.isAlive = true;
        }).catch((err) => {
            if (cb) cb(err);
            this.handleError(err);
        });
    }
    public set(sid: any, sess: any, cb?: any): void {
        this.client.set(sid, JSON.stringify(sess), {
            EX: this.ttl
        }).then((result) => {
            if (cb) cb(null, this);
            this.isAlive = true;
        }).catch((err) => {
            if (cb) cb(err);
            this.handleError(err);
        });
    }
    public touch(sid: any, sess: any, cb?: any): void {
        this.client.expire(sid, this.ttl).then((result) => {
            if (cb) cb(null, this);
            this.isAlive = true;
        }).catch((err) => {
            if (cb) cb(err);
            this.handleError(err);
        });
    }
    public destroy(sid: any, cb?: any): void {
        this.client.del(sid).then((result) => {
            if (cb) cb(null, this);
            this.isAlive = true;
        }).catch((err) => {
            if (cb) cb(err);
            this.handleError(err);
        });
    }
}
