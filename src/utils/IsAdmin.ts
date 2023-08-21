// import { NextFunction } from "express";
// import type * as E from 'express';
// interface Json {
//     success: boolean;
//     data: any[];
//   }

//   type Send<T = Response> = (body?: Json) => T;

//   interface CustomResponse extends Response {
//     json: Send<this>;
//   }
// export const isAdmin = (req: Request, res: E.Response<CustomResponse>, next: NextFunction) => {
//   const userRole = req.user?.role;

//   if (userRole !== "admin") {
//     return res.
//   }

//   next();
// };
