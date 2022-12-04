/// <reference types="node" />
/// <reference types="node" />
import EventEmitter from 'events';
import express from 'express';
import { NextJwtOptions, NextOptions } from './config/NextOptions';
import { NextLog } from './NextLog';
import { NextProfiler } from './NextProfiler';
import { NextRegistry } from './NextRegistry';
import { NextRouteBuilder } from './routing/NextRouteBuilder';
import { NextSessionManager } from '.';
import http from 'http';
import { RedisClientOptions } from 'redis';
import { NextSessionOptions } from './session/NextSessionManager';
import { NextSocket } from './sockets/NextSocket';
import { NextSocketRouter } from './sockets/NextSocketRouter';
import { NextHealthProfiler } from './health/NextHealthProfiler';
import { IHealth } from './health/IHealth';
import { NextRealtimeFunctions } from './sockets/NextRealtimeFunctions';
import { JWTController } from './security/JWT/JWTController';
export type NextApplicationEventNames = 'preinit' | 'init' | 'start' | 'stop' | 'restart' | 'error' | 'destroy';
export declare class NextApplication extends EventEmitter {
    express: express.Application;
    registry: NextRegistry;
    options: NextOptions;
    log: NextLog;
    profiler: NextProfiler;
    routeBuilder: NextRouteBuilder;
    server: http.Server;
    sessionManager: NextSessionManager;
    socket?: NextSocket;
    socketRouter?: NextSocketRouter;
    healthProfiler?: NextHealthProfiler;
    realtime?: NextRealtimeFunctions;
    jwtController?: JWTController;
    on(eventName: NextApplicationEventNames, listener: (...args: any[]) => void): this;
    enableHealthCheck(): void;
    registerHealthCheck(name: string, obj: IHealth): void;
    constructor(options?: NextOptions);
    registerFileSystemSession(rootPath: string, options?: NextSessionOptions): Promise<void>;
    registerInMemorySession(options?: NextSessionOptions): Promise<void>;
    registerRedisSession(config: RedisClientOptions<any, any>, ttl?: number, options?: NextSessionOptions): Promise<void>;
    registerJWT(jwt?: NextJwtOptions): void;
    init(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    destroy(): Promise<void>;
}
//# sourceMappingURL=NextApplication.d.ts.map