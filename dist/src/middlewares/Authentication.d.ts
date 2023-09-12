import { Request } from "express";
import { User } from "src/types";
export interface TokenRequest extends Request {
  user: User;
}
export declare const authenticateToken: any;
