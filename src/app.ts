import express from "express";
import cors from "cors";
import http from "http";
import "dotenv/config";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
// import AWS from "aws-sdk";
import routes from "./routes";
import { errorHandeler } from "./middlewares/ErrorHandler";
import { client } from "./redis";
import pino from "pino-http";
import * as Sentry from "@sentry/node";
// import { asyncLoggerMiddleware } from "./middlewares/WinstonLogger";

if (!process.env.TOKEN_SECRET) {
  throw new Error("TOKEN_SECRET must be set in .env file");
}
// AWS.config.update({
//   accessKeyId: "AKIAW7VUGLFTOU63FWU6",
//   secretAccessKey: "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",
// });
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tpm/" }));
const port = 3000;
const server = http.createServer(app);
app.use(pino({ level: "info", messageKey: ["HTTP"], redact: ["headers"] }));
Sentry.init({
  dsn: "https://a88630c764b0a2542681f10a431cc717@o4506155496505344.ingest.sentry.io/4506155504697344",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
app.use(Sentry.Handlers.requestHandler());
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

app.use(errorHandeler);
// server runtime
server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
