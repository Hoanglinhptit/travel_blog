import { CustomError } from "./ErrorHandler";
export declare class BadRouteError extends CustomError {
    statusCode: number;
    constructor();
    formatErrors(): {
        message: string;
    }[];
}
