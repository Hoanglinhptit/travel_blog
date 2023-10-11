import express from "express";
import cors from "cors";
import http from "http";
import "dotenv/config";
import fileUpload from "express-fileupload";
// import bodyParser from "body-parser";
import AWS from "aws-sdk";
import routes from "./routes";
import { errorHandeler } from "./middlewares/ErrorHandler";
// import { DatabaseError } from "./middlewares/DatabaseError";

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
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tpm/" }));
const port = 3000;
const server = http.createServer(app);
routes(app);
app.get("/", (req, res) => res.send("Hello Mai Meo"));
app.use(errorHandeler);

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
