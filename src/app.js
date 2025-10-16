import express, { json, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(json());
app.use(urlencoded());
app.use(cors());
app.use(cookieParser());
app.use(express.static("public/temp"));

export { app };