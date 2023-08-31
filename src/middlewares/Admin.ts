import { NextFunction, Response } from "express";
import { TokenRequest } from "./Authentication";
export const isAdmin: any = (
  req: TokenRequest,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  if (user && user.role === "admin") {
    next(); // User has admin role, proceed to the next middleware/route handler
  } else {
    res.sendStatus(403);
  }
};
