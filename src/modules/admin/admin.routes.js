const express = require("express");
const router = express.Router();
const { verifyAdminMiddleware } = require("./admin.middleware");
const {
  adminLoginController,
  adminRegisterController,
  getDashboardStatsController,
  getAllUsersController,
  getUserDetailsController,
  getUserPetsController,
  verifyUserController,
  requestUserRecheckController,
  deleteUserController,
  getAllPetsController,
  getPetDetailsController,
  approvePetController,
  rejectPetController,
  deletePetController,
} = require("./admin.controller");

// Public routes (for login/register)
router.post("/login", adminLoginController);
router.post("/register", adminRegisterController);

// Protected routes (require admin authentication)
router.get("/dashboard", verifyAdminMiddleware, getDashboardStatsController);

// User management
router.get("/users", verifyAdminMiddleware, getAllUsersController);
router.get("/users/:id", verifyAdminMiddleware, getUserDetailsController);
router.get("/users/:id/pets", verifyAdminMiddleware, getUserPetsController);
router.put("/users/:id/verify", verifyAdminMiddleware, verifyUserController);
router.put("/users/:id/recheck", verifyAdminMiddleware, requestUserRecheckController);
router.delete("/users/:id", verifyAdminMiddleware, deleteUserController);

// Pet management
router.get("/pets", verifyAdminMiddleware, getAllPetsController);
router.get("/pets/:id", verifyAdminMiddleware, getPetDetailsController);
router.put("/pets/:id/approve", verifyAdminMiddleware, approvePetController);
router.put("/pets/:id/reject", verifyAdminMiddleware, rejectPetController);
router.delete("/pets/:id", verifyAdminMiddleware, deletePetController);

module.exports = router;