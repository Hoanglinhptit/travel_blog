import { login, register, getUsers } from "./controllers/AuthControllers";
import {
  createPost,
  createPostAdmin,
  getPostByID,
  getPosts,
  getPendingPosts,
  updatePostStatus,
  updatePost,
  deletePost,
} from "./controllers/PostControllers";
import type { Express } from "express";
import { authenticateToken } from "./middlewares/Authentication";
import { isAdmin } from "./middlewares/Admin";

export default function routes(app: Express) {
  // Auth routes
  app.route("/auth/login").post(login);
  app.route("/auth/register").post(register);

  // Protected
  app.route("/admin/users").get(authenticateToken, isAdmin, getUsers);

  // Post route
  app.route("/api/posts").get(getPosts).post(authenticateToken, createPost);
  app
    .route("/api/posts/:id")
    .get(getPostByID)
    .patch(authenticateToken, isAdmin, updatePostStatus)
    .put(authenticateToken, updatePost)
    .delete(authenticateToken, deletePost);
  app
    .route("/api/admin/posts")
    .get(authenticateToken, isAdmin, getPendingPosts)
    .post(authenticateToken, isAdmin, createPostAdmin);
}
