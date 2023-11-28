import { Router } from "express";
import { prisma } from "../../prisma/db.setup";
// import { validateRequest } from "zod-express-middleware";
// import { z } from "zod";
// import { authMiddleWare } from "../auth-utils";

const carvingsController = Router();

carvingsController.get("/carvings", async (req, res) => {
  const carvings = await prisma.carving.findMany();
  return res.json(carvings);
});

export { carvingsController };
