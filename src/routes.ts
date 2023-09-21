import type { Express } from "express";
import { authenticateToken } from "./middlewares/Authentication";
import { isAdmin } from "./middlewares/Admin";
import { login, register, getUsers } from "./controllers/AuthControllers";
import {
  createPost,
  createPostAdmin,
  getPostByID,
  getPosts,
  // getPendingPosts,
  updatePostStatus,
  updatePost,
  deletePost,
  getPostsAdmin,
} from "./controllers/PostControllers";
import {
  getCategories,
  getCategoryPosts,
  createCategories,
} from "./controllers/CategoriesControllers";
import {
  getTags,
  getTagsPosts,
  createTags,
} from "./controllers/TagControllers";
export default function routes(app: Express) {
  // Auth routes
  app.route("/auth/login").post(login);
  app.route("/auth/register").post(register);

  // Protected
  app.route("/admin/users").get(authenticateToken, isAdmin, getUsers);

  // Post route
  app
    .route("/api/posts")
    .get(getPosts) // get list post include clone user
    .post(authenticateToken, createPost); /// create post user , admin
  // .get(authenticateToken, isAdmin, getPostsAdmin);
  app
    .route("/api/posts/:id")
    .get(getPostByID)
    .patch(authenticateToken, isAdmin, updatePostStatus)
    .put(authenticateToken, updatePost)
    .delete(authenticateToken, deletePost);
  app
    .route("/api/admin/posts")
    .get(authenticateToken, isAdmin, getPostsAdmin)
    .post(authenticateToken, isAdmin, createPostAdmin);

  // Categories routes
  app
    .route("/api/categories")
    .get(getCategories)
    .post(authenticateToken, isAdmin, createCategories);
  app.route("/api/categories/:id/posts").get(getCategoryPosts);

  // Tags API routes
  app
    .route("/api/tags")
    .get(getTags)
    .post(authenticateToken, isAdmin, createTags);
  app.route("/api/tags/:id/posts").get(getTagsPosts);
}
