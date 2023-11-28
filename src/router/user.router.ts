import { Router } from "express";
import { prisma } from "../../prisma/db.setup";
import { validateRequest } from "zod-express-middleware";
import { authMiddleWare } from "../auth-utils";
import { z } from "zod";
import { Carving } from "@prisma/client";

const userController = Router();

// update user patch
userController.patch(
  "/user/:id",
  validateRequest({
    body: z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    }),
  }),
  authMiddleWare,
  async (req, res) => {
    const { name, email, password } = req.body;
    const { id } = req.params;
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name,
        email: email,
        hashedPassword: password,
      },
    });
    return res.json(user);
  }
);

// upload carving
userController.post(
  "/user/upload",
  validateRequest({
    body: z.object({
      availableToPurchase: z.boolean(),
      carverName: z.string(),
      carvingName: z.string(),
      image: z.string(),
      price: z.number(),
      qty: z.number(),
      story: z.string(),
      type: z.string(),
      userId: z.number(),
    }),
  }),
  // authMiddleWare,
  // try when first looged in to see if it works
  async (req, res) => {
    const {
      image,
      carvingName,
      availableToPurchase,
      story,
      type,
      price,
      userId,
      carverName,
    } = req.body;
    console.log(req.body);
    if (!userId)
      return res.status(401).json({
        message: "User not found, need to be logged in to upload a carving",
      });
    const carving = await prisma.carving.create({
      data: {
        image: image,
        carvingName: carvingName,
        userId: userId,
        carverName: carverName,
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

// get users carvings by id
userController.get("/user/carvings/:id", async (req, res) => {
  const { id } = req.params;
  const carvings = await prisma.carving.findMany({
    where: {
      id: Number(id),
    },
  });
  return res.json(carvings);
});

// delete carving
userController.delete(
  "/user/carvings/:id",
  authMiddleWare,
  async (req, res) => {
    const { id } = req.params;
    const carving = await prisma.carving.delete({
      where: {
        id: Number(id),
      },
    });
    return res.json(carving);
  }
);

// put carving in user cart
userController.post("/user/cart", authMiddleWare, async (req, res) => {
  const { carvingId, userId } = req.body;
  const carving = await prisma.carving.findFirst({
    where: {
      id: Number(carvingId),
    },
  });
  if (!carving) return res.status(401).json({ message: "Carving not found" });
  const user = await prisma.user.findFirst({
    where: {
      id: Number(userId),
    },
  });
  if (!user) return res.status(401).json({ message: "User not found" });
  const cart = await prisma.cart.create({
    data: {
      userId: user.id,
      carvingId: carving.id,
      qty: carving.qty,
    },
  });
  return res.json(cart);
});

// get users cart
userController.get("/user/cart/:id", async (req, res) => {
  const { id } = req.params;
  const cart = await prisma.cart.findMany({
    where: {
      userId: parseInt(id),
    },
  });

  return res.json(cart);
});

// delete carving from cart
userController.delete("/user/cart/:id", async (req, res) => {
  const { id } = req.params;
  const cart = await prisma.cart.delete({
    where: {
      id: Number(id),
    },
  });
  return res.json(cart);
});

// get users favorites
userController.get("/user/favorites/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const favorites = await prisma.favorites.findMany({
    where: {
      userId: parseInt(id),
    },
  });
  return res.json(favorites);
});

// add carving to favorites
userController.post("/user/favorites", async (req, res) => {
  const { carvingId, userId } = req.body;
  const carving = await prisma.carving.findFirst({
    where: {
      id: Number(carvingId),
    },
  });

  if (!carving) return res.status(401).json({ message: "Carving not found" });
  const user = await prisma.user.findFirst({
    where: {
      id: Number(userId),
    },
  });
  if (!user) return res.status(401).json({ message: "User not found" });
  const favorites = await prisma.favorites.create({
    data: {
      userId: user.id,
      carvingId: carving.id,
    },
  });
  return res.json(favorites);
});

// delete carving from favorites
userController.delete("/user/favorites/:id/:userId", async (req, res) => {
  const { id, userId } = req.params;

  const favorite = await prisma.favorites.findFirst({
    where: {
      carvingId: parseInt(id),
    },
  });

  if (!favorite) {
    return res.status(404).json({ message: "Favorite not found" });
  }

  if (favorite.userId !== parseInt(userId)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const deletedFavorite = await prisma.favorites.delete({
    where: {
      id: favorite.id,
    },
  });

  return res.json(deletedFavorite);
});

// purchase carving

userController.post(
  "/user/purchase",
  validateRequest({
    body: z.object({
      userId: z.number(),
      carvingId: z.array(z.number()).min(1),
      name: z.string(),
      address: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.number(),
      cardType: z.string(),
      cardNumbers: z.number(),
      expMonthDate: z.string(),
      expYearDate: z.string(),
      total: z.number(),
    }),
  }),
  async (req, res) => {
    const {
      userId,
      carvingId,
      name,
      address,
      city,
      state,
      zip,
      cardType,
      cardNumbers,
      expMonthDate,
      expYearDate,
      total,
    } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        id: Number(userId),
      },
    });
    if (!user) return res.status(401).json({ message: "User not found" });
    const carvings: Carving[] = [];
    for (const id of carvingId) {
      const findIds = await prisma.carving.findFirst({
        where: {
          id: Number(id),
        },
      });
      if (!findIds)
        return res.status(401).json({ message: "Carving not found" });
      carvings.push(findIds);
    }

    if (!carvings.length)
      return res.status(401).json({ message: "Carving not found" });

    const purchase = await prisma.purchases.create({
      data: {
        userId: user.id,
        carving: {
          connect: carvings.map((carving) => ({ id: carving.id })),
        },
        name: name,
        address: address,
        city: city,
        state: state,
        zip: zip,
        cardType: cardType,
        cardNumbers: cardNumbers,
        expMonthDate: expMonthDate,
        expYearDate: expYearDate,
        total: total,
      },
    });
    return res.json(purchase);
  }
);

// delete cart items
userController.delete("/user/cart/:id", async (req, res) => {
  const { id } = req.params;
  const cart = await prisma.cart.delete({
    where: {
      id: Number(id),
    },
  });
  return res.json(cart);
});

export { userController };
