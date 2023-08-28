import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
// import { createClient } from "@libsql/client";
import "dotenv/config";
import routes from "./routes";
import { errorHandeler } from "./middlewares/ErrorHandler";
// import { connectToTursoDB } from "./utils/getHttpTurso";
// import { BadRouteError } from "./middlewares/BadRouteHandler";
// import { DatabaseError } from "./middlewares/DatabaseError";
if (!process.env.TOKEN_SECRET) {
  throw new Error("TOKEN_SECRET must be set in .env file");
}

// const client = createClient({
//   url: process.env.DATABASE_URL as string,
//   authToken: process.env.TOKEN_DB as string,
// });
// console.log("client ", client.execute());

// const main = async () => {
//   try {
//     const data = await connectToTursoDB();
//     console.log("Data from Turso DB:", data);
//   } catch (error) {
//     // Handle errors
//   }
// };

// main();
const app = express();
const port = 3000;
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

routes(app);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// app.all("/*", () => {
//   throw new BadRouteError();
// });

app.use(errorHandeler);

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
