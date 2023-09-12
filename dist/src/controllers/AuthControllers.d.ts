import { Request, Response } from "express";
import { ResponseBody } from "../types";
declare const login: (
  req: Request,
  res: Response<ResponseBody>,
) => Promise<Response<ResponseBody, Record<string, any>>>;
declare const register: (
  req: Request,
  res: Response,
) => Promise<Response<any, Record<string, any>>>;
declare const getUsers: (
  req: Request,
  res: Response,
) => Promise<Response<any, Record<string, any>>>;
export { login, register, getUsers };
