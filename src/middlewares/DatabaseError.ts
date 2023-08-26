import { CustomError } from "./ErrorHandler";
export class DatabaseError extends CustomError {
  statusCode = 500;
  reason = "Error connecting to database";
  constructor() {
    super();
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
  formatErrors() {
    return [{ message: this.reason }];
  }
}
