import { NextFunction, Request, Response } from 'express'

export interface INextContextBase {
    //#region Express Parameters
    req: Request;
    res: Response;
    next: NextFunction;
    //#endregion

    //#region Request Parameters
    body: any;
    query: any;
    params: any;
    cookies: any;
    headers: any;
    protocol: string;
    ip: string;
    ipv4: boolean;
    ipv6: boolean;
    method: string;
    url: string;
    path: string;
    files?: Array<Express.Multer.File>;
    fileCount?: number;
    //#endregion

    //#region Session Parameters
    session: Object;
    sessionId: string;
    //#endregion

    get token(): string | null;
}
export class NextContextBase implements INextContextBase {
    //#region Express Parameters
    public req: Request;
    public res: Response;
    public next: NextFunction;
    //#endregion

    //#region Request Parameters
    public body: any;
    public query: any;
    public params: any;
    public cookies: any;
    public headers: any;
    public protocol: string;
    public ip: string;
    public ipv4: boolean;
    public ipv6: boolean;
    public method: string;
    public url: string;
    public path: string;
    public files?: Array<Express.Multer.File>;
    public fileCount?: number;
    //#endregion

    //#region Session Parameters
    public session: Object;
    public sessionId: string;
    //#endregion

    public get token(): string | null {
        return (this.req as any).token || (this.req as any).access_token || (this.req as any).accessToken || null;
    }

    constructor(req: Request, res: Response, next: NextFunction) {
        this.req = req;
        this.res = res;
        this.next = next;

        this.body = req.body;
        this.query = req.query;
        this.params = req.params;
        this.cookies = req.cookies;
        this.headers = req.headers;
        this.protocol = req.protocol;
        this.files = (req as any).files;
        this.fileCount = (req as any).fileCount;
        this.ip = req.ip;
        this.ipv4 = ((req.ip || "").split(":")[0]) === req.ip;
        this.ipv6 = !this.ipv4;
        this.method = req.method;
        this.url = req.url;
        this.path = req.path;

        this.session = (req as any).session;
        this.sessionId = (this.session && (this.session as any).id) || (req as any).sessionId;
    }
}

export interface NextContext<TBODY, TQUERY = TBODY, TPARAMS = TBODY> extends INextContextBase {
    body: TBODY;
    query: TQUERY;
    params: TPARAMS;
}