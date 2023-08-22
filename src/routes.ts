import { login, register } from "./controllers/AuthControllers";
import type { Express } from "express";

export default function routes(app: Express) {
  // Auth routes
  app.route("/auth/login").post(login);
  app.route("/auth/register").post(register);

  // Protected
  // app.route("/admin/users").get(isAuthenticated, isAdmin, getUsers);
}
