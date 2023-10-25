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
const redis_1 = require("./redis");
const Logger_1 = require("./middlewares/Logger");
// import compression from "compression";
if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET must be set in .env file");
}
aws_sdk_1.default.config.update({
    accessKeyId: "AKIAW7VUGLFTOU63FWU6",
    secretAccessKey: "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",
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, express_fileupload_1.default)({ useTempFiles: true, tempFileDir: "/tpm/" }));
const port = 3000;
const server = http_1.default.createServer(app);
// app.use(compression());
app.use(Logger_1.asyncLoggerMiddleware);
(0, routes_1.default)(app);
// redis runtime
const connectRedis = async () => {
    await redis_1.client
        .connect()
        .then(() => console.log("Server Redis connected on 192.168.70.134:6379"))
        .catch((e) => console.error(e));
};
connectRedis();
process.on("SIGINT", () => {
    console.log("Shutting down the server...");
    redis_1.client.disconnect().catch(() => {
        console.log("Redis client disconnected. Server shutting down.");
        process.exit();
    });
});
// app.use(loggerMail)
app.use(ErrorHandler_1.errorHandeler);
// server runtime
server.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map