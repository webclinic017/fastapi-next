import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Stream } from 'stream';
import { ApiResponse, NextApplication, NextContextBase } from '..';
import { ValidationResult } from '../validation/ValidationResult';
import { NextRouteResponse } from './NextRouteResponse';

export class NextRouteBuilder {
    private paths: string[] = [];
    constructor(app: NextApplication) {
        this.paths = app.options.routerDirs;
        this.paths.forEach(p => {
            var results = this.scanDir(p);
            results.forEach(({ routePath, realpath }: any) => {
                this.registerRoute(p, routePath, app, realpath);
            });
        });
    }
    private registerRoute(p: string, routePath: any, app: NextApplication, realpath: any) {
        var parts = path.relative(p, routePath).split(path.sep);
        var expressRoutePath = "/" + parts.map(part => {
            return part.replace(/\[/g, ":").replace(/\]/g, "");
        }).join("/");
        var specificMethod = path.basename(expressRoutePath).split(".")[1];
        var httpMethod = expressRoutePath.indexOf(":") > -1 ? "get" : (specificMethod || "get");
        if (specificMethod == httpMethod && specificMethod) {
            expressRoutePath = expressRoutePath.replace("." + specificMethod, "");
        }
        if (app.options.debug) {
            app.log.info(`Registering route ${httpMethod} ${expressRoutePath}`);
        }
        var route = require(realpath);
        app.express[httpMethod](expressRoutePath, (this.routeMiddleware(app)).bind(null, route));
        if (parts.length > 1 && parts[parts.length - 1] === "index") {
            app.express[httpMethod](expressRoutePath.substring(0, expressRoutePath.length - "index".length), (this.routeMiddleware(app)).bind(null, route));
        }
    }

    private routeMiddleware(app: NextApplication) {
        return async (route: any, req: Request, res: Response, next: NextFunction) => {
            var ctx: NextContextBase = new NextContextBase(req, res, next);

            for (var plugin of app.registry.getPlugins()) {
                if (!(await plugin.middleware.call(plugin, ctx).catch(app.log.error))) {
                    break;
                }

                if (plugin.showInContext) {
                    (ctx as any)[plugin.name] = await plugin.retrieve.call(plugin, ctx);
                }
            }

            if (route.validate) {
                try {
                    var validationResult = route.validate(ctx);
                    if (validationResult instanceof Promise) {
                        validationResult = await validationResult.catch(app.log.error);
                    }
                    if (!validationResult || !validationResult.success) {
                        res.status(500).json(new ApiResponse<ValidationResult>(false, "validation error!", validationResult));
                        return;
                    }
                } catch (err) {
                    app.log.error(err);
                    var errorResult = new ValidationResult();
                    errorResult.error("err", (err || new Error()).toString());
                    res.status(500).json(new ApiResponse<ValidationResult>(false, "validation error!", errorResult));
                    return;
                }
            }
            var result = route.default(ctx);
            var isError = false;
            if (result instanceof Promise) {
                result = await result.catch((err) => {
                    isError = true;
                    app.log.error(err);
                });
            }
            if (result instanceof NextRouteResponse) {
                if (result.hasBody) {
                    if (result.body instanceof Stream) {
                        res.status(result.statusCode);
                        result.body.pipe(res);
                    }
                    else {
                        res.status(result.statusCode).send(result.body);
                    }
                } else {
                    res.status(result.statusCode).end();
                }
            }
            else {
                res.set("Content-Type", "application/json");
                if (isError) {
                    res.status(500).json(result);
                }
                else {
                    res.status(200).json(result);
                }
            }
            next();
        };
    }

    private scanDir(scanPath?: string) {
        if (!scanPath) return null;
        var files = [];
        fs.readdirSync(scanPath, {
            withFileTypes: true
        }).forEach(dir => {
            if (dir.isDirectory()) {
                this.scanDir(path.join(scanPath, dir.name)).forEach(f => {
                    files.push(f);
                });
            }
            else {
                if (dir.name.endsWith('.ts') || dir.name.endsWith('.js')) {
                    files.push({
                        routePath: path.join(scanPath, path.basename(dir.name, path.extname(dir.name))),
                        realpath: path.join(scanPath, dir.name)
                    });
                }
            }
        });
        return files;
    }
}