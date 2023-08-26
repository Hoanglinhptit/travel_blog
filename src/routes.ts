import { login, register, getUsers } from "./controllers/AuthControllers";
import type { Express } from "express";
import { authenticateToken } from "./middlewares/Authentication";
import { isAdmin } from "./middlewares/Admin";

export default function routes(app: Express) {
  // Auth routes
  app.route("/auth/login").post(login);
  app.route("/auth/register").post(register);

  // Protected
  app.route("/admin/users").get(authenticateToken, isAdmin, getUsers);
}
