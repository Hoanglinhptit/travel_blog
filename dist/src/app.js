"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
require("dotenv/config");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const body_parser_1 = __importDefault(require("body-parser"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const routes_1 = __importDefault(require("./routes"));
const ErrorHandler_1 = require("./middlewares/ErrorHandler");
const BadRouteHandler_1 = require("./middlewares/BadRouteHandler");
// import { DatabaseError } from "./middlewares/DatabaseError";
if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET must be set in .env file");
}
aws_sdk_1.default.config.update({
    accessKeyId: "AKIAW7VUGLFTOU63FWU6",
    secretAccessKey: "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",
    // region: "US East (N. Virginia) us-east-1",
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, express_fileupload_1.default)({ useTempFiles: true, tempFileDir: "/tpm/" }));
const port = 3000;
const server = http_1.default.createServer(app);
(0, routes_1.default)(app);
app.all("/*", () => {
    throw new BadRouteHandler_1.BadRouteError();
});
app.use(ErrorHandler_1.errorHandeler);
server.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map