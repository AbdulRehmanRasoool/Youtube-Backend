import express, { json, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import videoRouter from "./routes/video.route.js";
import userRouter from "./routes/user.route.js";
import likeRouter from "./routes/like.route.js";
import playlistRouter from "./routes/playlist.route.js";

const app = express();

app.use(json());
app.use(urlencoded());
app.use(cors());
app.use(cookieParser());
app.use(express.static("public/temp"));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/playlist", playlistRouter);

export { app };