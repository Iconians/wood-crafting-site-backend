import { User } from "@prisma/client";
import express from "express";
import dotenv from "dotenv";
import { carvingsController } from "./router/carvings.router";
import { authController } from "./router/auth.router";
import cors from "cors";
import { userController } from "./router/user.router";

dotenv.config();
// note I 

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }

  namespace NodeJS {
    export interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string;
    }
  }
}

["DATABASE_URL", "JWT_SECRET"].forEach((env) => {
  if (process.env[env] === undefined) {
    throw new Error(`Environment variable ${env} is missing`);
  }
});

const app = express();
app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(authController);
app.use(carvingsController);
app.use(userController);

app.listen(3000);
