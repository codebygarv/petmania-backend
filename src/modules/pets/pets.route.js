const express = require("express");
const router = express.Router();
const { verifyAuthMiddleware } = require("../user/user.middleware");
const {
  createPetController,
  getPetsController,
  getPetController,
  getMyPetsController,
  markAdoptedController,
  updatePetController,
  deletePetController
} = require("./pets.controller");

router.post("/create-pet", verifyAuthMiddleware, createPetController);
router.get("/get-pets", verifyAuthMiddleware, getPetsController);
router.get("/get-pet/:id", verifyAuthMiddleware, getPetController);
router.get("/get-my-pets", verifyAuthMiddleware, getMyPetsController);
router.put("/mark-adopted/:id", verifyAuthMiddleware, markAdoptedController);
router.put("/update-pet/:id", verifyAuthMiddleware, updatePetController);
router.delete("/delete-pet/:id", verifyAuthMiddleware, deletePetController);

module.exports = router;