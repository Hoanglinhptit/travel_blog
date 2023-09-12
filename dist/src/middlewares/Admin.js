"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = (req, res, next) => {
    const user = req.user;
    if (user && user.role === "admin") {
        next(); // User has admin role, proceed to the next middleware/route handler
    }
    else {
        res.sendStatus(403);
    }
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=Admin.js.map