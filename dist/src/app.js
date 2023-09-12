"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
require("dotenv/config");
const routes_1 = __importDefault(require("./routes"));
const ErrorHandler_1 = require("./middlewares/ErrorHandler");
// import { BadRouteError } from "./middlewares/BadRouteHandler";
// import { DatabaseError } from "./middlewares/DatabaseError";
if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET must be set in .env file");
}
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const port = 3000;
const server = http_1.default.createServer(app);
(0, routes_1.default)(app);
app.get("/", (req, res) => {
    res.send("Hello World!");
});
// app.all("/*", () => {
//   throw new BadRouteError();
// });
app.use(ErrorHandler_1.errorHandeler);
server.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map