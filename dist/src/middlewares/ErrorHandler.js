"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = exports.errorHandeler = void 0;
class CustomError extends Error {
    constructor() {
        super();
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.CustomError = CustomError;
const errorHandeler = (err, req, res, next) => {
    console.error(err);
    if (res.headersSent) {
        return next(err);
    }
    if (err instanceof CustomError) {
        return res.status(err.statusCode).send({ errors: err.formatErrors() });
    }
    console.error("Something went wrong. Exiting in 10 seconds...");
    setTimeout(() => {
        process.exit(1);
    }, 10000);
};
exports.errorHandeler = errorHandeler;
//# sourceMappingURL=ErrorHandler.js.map