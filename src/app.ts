import express from "express";
import cors from "cors";
import http from "http";
import "dotenv/config";
import routes from "./routes";

if (!process.env.TOKEN_SECRET) {
  throw new Error("TOKEN_SECRET must be set in .env file");
}

const app = express();
const port = 3000;
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

routes(app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
