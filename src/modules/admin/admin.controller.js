const Admin = require("./models/admin.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../user/models/user.model");
const Pet = require("../pets/models/pets.models");

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Admin Login
const adminLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid email or password" },
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        error: { message: "Account is deactivated" },
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid email or password" },
      });
    }

    const token = generateToken({
      adminId: admin._id,
      email: admin.email,
      role: admin.role,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// Admin Register
const adminRegisterController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        error: { message: "Admin already exists with this email" },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await admin.save();

    const token = generateToken({
      adminId: admin._id,
      email: admin.email,
      role: admin.role,
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error("Admin register error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// Get Dashboard Stats
const getDashboardStatsController = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const adharVerifiedUsers = await User.countDocuments({ isAdharVerified: true });

    const totalPets = await Pet.countDocuments();
    const approvedPets = await Pet.countDocuments({ isApproved: true });
    const pendingPets = await Pet.countDocuments({ isApproved: false, isAdopted: false });
    const adoptedPets = await Pet.countDocuments({ isAdopted: true });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        adharVerifiedUsers,
        totalPets,
        approvedPets,
        pendingPets,
        adoptedPets,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// Get All Users
const getAllUsersController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isVerified, isAdharVerified } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }
    if (isVerified !== undefined) {
      query.isVerified = isVerified === "true";
    }
    if (isAdharVerified !== undefined) {
      query.isAdharVerified = isAdharVerified === "true";
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select("-password -confirmPassword")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// Get Single User Details
const getUserDetailsController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -confirmPassword");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user details error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// Verify User
const verifyUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, isAdharVerified, userVerified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isAdharVerified !== undefined) user.isAdharVerified = isAdharVerified;
    if (userVerified !== undefined) user.userVerified = userVerified;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Verify user error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// Delete User
const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// Get All Pets
const getAllPetsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isApproved, city } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { breed: { $regex: search, $options: "i" } },
      ];
    }
    if (isApproved !== undefined) {
      query.isApproved = isApproved === "true";
    }
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const pets = await Pet.find(query)
      .populate("userId", "name email avatar phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Pet.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        pets,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all pets error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// Get Pet Details
const getPetDetailsController = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id).populate("userId", "name email avatar phoneNumber");

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: { message: "Pet not found" },
      });
    }

    return res.status(200).json({
      success: true,
      data: { pet },
    });
  } catch (error) {
    console.error("Get pet details error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// Approve Pet
const approvePetController = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: { message: "Pet not found" },
      });
    }

    pet.isApproved = true;
    await pet.save();

    return res.status(200).json({
      success: true,
      message: "Pet approved successfully",
      data: { pet },
    });
  } catch (error) {
    console.error("Approve pet error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// Reject Pet
const rejectPetController = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        error: { message: "Pet not found" },
      });
    }

    pet.isApproved = false;
    await pet.save();

    return res.status(200).json({
      success: true,
      message: reason ? `Pet rejected: ${reason}` : "Pet rejected successfully",
      data: { pet },
    });
  } catch (error) {
    console.error("Reject pet error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

// Delete Pet
const deletePetController = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findByIdAndDelete(id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: { message: "Pet not found" },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pet deleted successfully",
    });
  } catch (error) {
    console.error("Delete pet error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Internal server error" },
    });
  }
};

module.exports = {
  adminLoginController,
  adminRegisterController,
  getDashboardStatsController,
  getAllUsersController,
  getUserDetailsController,
  verifyUserController,
  deleteUserController,
  getAllPetsController,
  getPetDetailsController,
  approvePetController,
  rejectPetController,
  deletePetController,
};