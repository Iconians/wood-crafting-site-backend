import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma/db.setup";

const saltRounds = 11;

export const encryptPassword = (password: string) => {
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const createUnsecuredUserInfo = (user: User) => {
  return {
    email: user.email,
    name: user.name,
  };
};

export const createAuthTokenForUser = (user: User) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(createUnsecuredUserInfo(user), process.env.JWT_SECRET);
};

const jwtInfoSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

export const getDataFromAuthToken = (token?: string) => {
  if (!token) return null;
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  try {
    return jwtInfoSchema.parse(jwt.verify(token, process.env.JWT_SECRET));
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const authMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const [, token] = req.headers.authorization?.split(" ") || [];
  const jwtData = getDataFromAuthToken(token);
  if (!jwtData) {
    return res.status(401).json({ error: "Unauthorized, invalid token" });
  }
  const userFomJwt = await prisma.user.findFirst({
    where: {
      email: jwtData.email,
    },
  });
  if (!userFomJwt) {
    return res.status(401).json({ message: "User not found" });
  }
  req.user = userFomJwt;
  next();
};
