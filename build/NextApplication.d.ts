/// <reference types="node" />
import EventEmitter from 'events';
import express from 'express';
import { NextOptions } from './config/NextOptions';
import { NextLog } from './NextLog';
import { NextProfiler } from './NextProfiler';
import { NextRegistry } from './NextRegistry';
import { NextRouteBuilder } from './routing/NextRouteBuilder';
export declare class NextApplication extends EventEmitter {
    express: express.Application;
    registry: NextRegistry;
    options: NextOptions;
    log: NextLog;
    profiler: NextProfiler;
    routeBuilder: NextRouteBuilder;
    constructor(options: NextOptions);
    init(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    destroy(): Promise<void>;
}
//# sourceMappingURL=NextApplication.d.ts.map