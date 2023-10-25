import express, { NextFunction } from "express";
import cors from "cors";
import http from "http";
import "dotenv/config";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import AWS from "aws-sdk";
import routes from "./routes";
import { errorHandeler } from "./middlewares/ErrorHandler";
import { client } from "./redis";
import { asyncLoggerMiddleware, loggerMail } from "./middlewares/Logger";
import compression from "compression";

if (!process.env.TOKEN_SECRET) {
  throw new Error("TOKEN_SECRET must be set in .env file");
}
AWS.config.update({
  accessKeyId: "AKIAW7VUGLFTOU63FWU6",
  secretAccessKey: "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",
});
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tpm/" }));
const port = 3000;
const server = http.createServer(app);
app.use(compression());
app.use(asyncLoggerMiddleware);
routes(app);
// redis runtime
const connectRedis = async () => {
  await client
    .connect()
    .then(() => console.log("Server Redis connected on 192.168.70.134:6379"))
    .catch((e: Error) => console.error(e));
};
connectRedis();

process.on("SIGINT", () => {
  console.log("Shutting down the server...");
  client.disconnect().catch(() => {
    console.log("Redis client disconnected. Server shutting down.");
    process.exit();
  });
});

// app.use(loggerMail)
app.use(errorHandeler);
// server runtime
server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
