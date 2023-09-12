"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = void 0;
const ErrorHandler_1 = require("./ErrorHandler");
class DatabaseError extends ErrorHandler_1.CustomError {
    constructor() {
        super();
        this.statusCode = 500;
        this.reason = "Error connecting to database";
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
    formatErrors() {
        return [{ message: this.reason }];
    }
}
exports.DatabaseError = DatabaseError;
//# sourceMappingURL=DatabaseError.js.map