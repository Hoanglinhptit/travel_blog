import { Request, Response, NextFunction } from "express";
declare abstract class CustomError extends Error {
    abstract statusCode: number;
    constructor();
    abstract formatErrors(): {
        message: string;
        field?: string;
    }[];
}
type ErrorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => void;
declare const errorHandeler: (err: Error, req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export { ErrorMiddleware, errorHandeler, CustomError };
