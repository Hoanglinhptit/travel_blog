import { CustomError } from "./ErrorHandler";

export class BadRouteError extends CustomError {
  statusCode = 404;
  constructor() {
    super();
    Object.setPrototypeOf(this, BadRouteError.prototype);
  }
  formatErrors() {
    return [{ message: "This route does not exist" }];
  }
}
