/* eslint-disable @typescript-eslint/no-explicit-any */
import { login } from "../controllers/AuthControllers";

export const AuthRoutes = (app: any) => {
  app.route("/auth/login").post(login);
  //   app.route("/auth/register").post(register);
};
