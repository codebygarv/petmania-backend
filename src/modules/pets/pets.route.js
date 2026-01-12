const express = require("express");
const router = express.Router();

router.post("/create-pet", verifyAuthMiddleware, createPetController);
router.get("/get-pets", verifyAuthMiddleware, getPetsController);
router.get("/get-pet/:id", verifyAuthMiddleware, getPetController);
router.put("/update-pet/:id", verifyAuthMiddleware, updatePetController);
router.delete("/delete-pet/:id", verifyAuthMiddleware, deletePetController);

module.exports = router;
