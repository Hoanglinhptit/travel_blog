import { NextFunction, Request, Response } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.body;
  if (user && user.role === "admin") {
    next(); // User has admin role, proceed to the next middleware/route handler
  } else {
    res.sendStatus(403);
  }
};
