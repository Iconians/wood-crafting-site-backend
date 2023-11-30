import { Router } from "express";
import { prisma } from "../../prisma/db.setup";

const carvingsController = Router();

carvingsController.get("/carvings", async (req, res) => {
  const carvings = await prisma.carving.findMany();
  return res.json(carvings);
});

export { carvingsController };
