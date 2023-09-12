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
    return res
        .status(400)
        .send({ errors: [{ message: "Something went wrong" }] });
};
exports.errorHandeler = errorHandeler;
//# sourceMappingURL=ErrorHandler.js.map