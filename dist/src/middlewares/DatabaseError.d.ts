import { CustomError } from "./ErrorHandler";
export declare class DatabaseError extends CustomError {
  statusCode: number;
  reason: string;
  constructor();
  formatErrors(): {
    message: string;
  }[];
}
