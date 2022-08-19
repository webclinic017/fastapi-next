import WebSocket from "ws";
import { NextApplication } from "../NextApplication";
import { NextSocketContext } from "./NextSocketContext";
import { NextSocketMessageBase } from "./NextSocketMessageBase";

export class NextRealtimeFunctions {
    public constructor(public app: NextApplication) {
    }
    public async getConnections() {
        return this.app.socket.getConnections();
    }
    public async send(message: NextSocketMessageBase, client: WebSocket) {
        const ctx = new NextSocketContext(message, client);
        ctx.sendRequest(message.path, message.body);
    }
    public async broadcast(message: NextSocketMessageBase) {
        this.app.socket.getConnections().forEach(socket => {
            const ctx = new NextSocketContext(message, socket);
            ctx.sendRequest(message.path, message.body);
        });
    }
    public async sendEvent(name: string, parameters: any[]) {
        this.app.socket.getConnections().forEach(socket => {
            const ctx = new NextSocketContext(null, socket);
            ctx.sendEvent(name, parameters);
        });
    }z
}