import express from "express";

import dotenv from "dotenv";
const app = express();
dotenv.config();
import morgan from "morgan";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
//MiddleWare
import notFoundMiddleware from "./middleware/notFoundMiddleware.js";
import errorHandler from "./middleware/errorHandler.js";

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

//DB
import connectDB from "./db/connect.js";
//rotes
import authRouter from "./routes/authRoutes.js";
import jobRouter from "./routes/jobRoutes.js";

import authenticateUser from "./middleware/auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// only when ready to deploy
app.use(express.static(path.resolve(__dirname, "./client/build")));

app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobRouter);

app.get("*", (res, req) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

app.use(notFoundMiddleware);
app.use(errorHandler);

const port = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Running On ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
