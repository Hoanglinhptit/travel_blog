/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
// import { RequestAuth } from "src/types";
import { User } from "src/types";
export interface TokenRequest extends Request {
  user: User;
}
export const authenticateToken: any = (
  req: TokenRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: any, user: any) => {
      if (err) return res.sendStatus(403);

      req.user = user;

      next();
    },
  );
};
