"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRouteError = void 0;
const ErrorHandler_1 = require("./ErrorHandler");
class BadRouteError extends ErrorHandler_1.CustomError {
    constructor() {
        super();
        this.statusCode = 404;
        Object.setPrototypeOf(this, BadRouteError.prototype);
    }
    formatErrors() {
        return [{ message: "This route does not exist" }];
    }
}
exports.BadRouteError = BadRouteError;
//# sourceMappingURL=BadRouteHandler.js.map