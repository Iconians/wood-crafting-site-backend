import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { prisma } from "../../prisma/db.setup";
import {
  comparePassword,
  createAuthTokenForUser,
  createUnsecuredUserInfo,
  encryptPassword,
} from "../auth-utils";

const authController = Router();

authController.post(
  "/login",
  validateRequest({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  }),
  async (req, res) => {
    const { email, password } = req.body;
    if (!res) {
      throw new Error("Response is undefined");
    }
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const passwordMatch = await comparePassword(password, user.hashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const userInfo = createUnsecuredUserInfo(user);
    const token = createAuthTokenForUser(user);

    return res?.status(200).json({ userinfo: userInfo, token });
  }
);

// sign up endpoint
authController.post(
  "/signup",
  validateRequest({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
      name: z.string(),
    }),
  }),
  async (req, res) => {
    const { email, password, name } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(401).json({ message: "User already exists" });
    }
    const newUser = await prisma.user.create({
      data: {
        email,
        hashedPassword: await encryptPassword(password),
        name,
      },
    });

    const userInfo = createUnsecuredUserInfo(newUser);
    const token = createAuthTokenForUser(newUser);

    return res?.status(200).json({ userInfo, token });
  }
);

export { authController as authController };
