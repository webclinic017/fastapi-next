import { randomUUID } from 'crypto';
import WebSocket from 'ws';
import { NextApplication } from '../NextApplication';
import { NextSocketMessageBase } from "./NextSocketMessageBase";


export class NextSocketContext {
    public constructor(public app: NextApplication, public message: NextSocketMessageBase, public socket: WebSocket) {
        this.message = message;
        this.socket = socket;
    }
    public send(data: any) {
        this.socket.send(JSON.stringify({
            type: 'response',
            data: data,
            path: this.message.path,
            id: this.message.id
        }));
    }
    public sendRequest(path: string, data: any) {
        this.socket.send(JSON.stringify({
            type: 'request',
            data: data,
            path: path,
            id: randomUUID()
        }));
    }
    public sendEvent(name: string, parameters: any[]) {
        this.socket.send(JSON.stringify({
            type: 'event',
            data: parameters,
            path: name
        }));
    }
    public close() {
        this.socket.close();
    }
}
