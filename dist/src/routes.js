"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Authentication_1 = require("./middlewares/Authentication");
const Admin_1 = require("./middlewares/Admin");
const AuthControllers_1 = require("./controllers/AuthControllers");
const PostControllers_1 = require("./controllers/PostControllers");
const CategoriesControllers_1 = require("./controllers/CategoriesControllers");
function routes(app) {
    // Auth routes
    app.route("/auth/login").post(AuthControllers_1.login);
    app.route("/auth/register").post(AuthControllers_1.register);
    // Protected
    app.route("/admin/users").get(Authentication_1.authenticateToken, Admin_1.isAdmin, AuthControllers_1.getUsers);
    // Post route
    app
        .route("/api/posts")
        .get(PostControllers_1.getPosts) // get list post include clone user
        .post(Authentication_1.authenticateToken, PostControllers_1.createPost); /// create post user , admin
    app
        .route("/api/posts/:id")
        .get(PostControllers_1.getPostByID)
        .patch(Authentication_1.authenticateToken, Admin_1.isAdmin, PostControllers_1.updatePostStatus)
        .put(Authentication_1.authenticateToken, PostControllers_1.updatePost)
        .delete(Authentication_1.authenticateToken, PostControllers_1.deletePost);
    app
        .route("/api/admin/posts")
        .get(Authentication_1.authenticateToken, Admin_1.isAdmin, PostControllers_1.getPendingPosts)
        .post(Authentication_1.authenticateToken, Admin_1.isAdmin, PostControllers_1.createPostAdmin);
    // Categories route
    app
        .route("/api/categories")
        .get(CategoriesControllers_1.getCategories)
        .post(Authentication_1.authenticateToken, Admin_1.isAdmin, CategoriesControllers_1.createCategories);
    app.route("/api/categories/:id/posts").get(CategoriesControllers_1.getCategoryPosts);
}
exports.default = routes;
//# sourceMappingURL=routes.js.map