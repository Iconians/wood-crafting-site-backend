import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { prisma } from "../../prisma/db.setup";
import {
  comparePassword,
  createAuthTokenForUser,
  createUnsecuredUserInfo,
} from "../auth-utils";

const authcontroller = Router();

authcontroller.post(
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
      throw new Error("Rosponse is undefined");
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

    const userinfo = createUnsecuredUserInfo(user);
    const token = createAuthTokenForUser(user);

    return res?.status(200).json({ userinfo, token });
  }
);

// make sign up controller

export { authcontroller };
