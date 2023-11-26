import { Router } from "express";
import { prisma } from "../../prisma/db.setup";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";
import { authMiddleWare } from "../auth-utils";

const carvingsController = Router();

carvingsController.get("/carvings", async (req, res) => {
  const carvings = await prisma.carving.findMany();
  return res.json(carvings);
});

carvingsController.post(
  "/user/upload",
  validateRequest({
    body: z.object({
      image: z.string(),
      carvingName: z.string(),
      availableToPurchase: z.boolean(),
      story: z.string(),
      type: z.string(),
      price: z.number(),
      id: z.number(),
    }),
  }),
  authMiddleWare,
  async (req, res) => {
    const { image, carvingName, availableToPurchase, story, type, price, id } =
      req.body;
    const user = await prisma.user.findFirst({
      where: {
        id: id,
      },
    });
    if (!user)
      return res.status(401).json({
        message: "User not found, need to be logged in to upload a carving",
      });
    const carving = await prisma.carving.create({
      data: {
        image: image,
        carvingName: carvingName,
        userId: user.id,
        carverName: user.name,
        availableToPurchase: availableToPurchase,
        story: story,
        type: type,
        price: price,
        qty: 1,
      },
    });
    return res.json(carving);
  }
);

export { carvingsController };
