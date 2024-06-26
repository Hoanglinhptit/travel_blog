import { Request, Response, NextFunction } from "express";
abstract class CustomError extends Error {
  abstract statusCode: number;
  constructor() {
    super();
    Object.setPrototypeOf(this, CustomError.prototype);
  }
  abstract formatErrors(): { message: string; field?: string }[];
}
type ErrorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

const errorHandeler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

export { ErrorMiddleware, errorHandeler, CustomError };
