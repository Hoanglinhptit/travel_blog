import express from "express";
import cors from "cors";
import http from "http";
import { routes } from "./routes";
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
