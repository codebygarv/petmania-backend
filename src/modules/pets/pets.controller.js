const Pet = require("./models/pets.models");
const User = require("../user/models/user.model");
const cloudinary = require("../../config/cloudinary")

const createPetController = async (req, res) => {
  try {
    const { images, name, description, age, breed, gender, color, type, pincode, city, state, country, lastVaccinationDate } = req.body;

    // req.email is set by verifyAuthMiddleware
    const user = await User.findOne({ email: req.email?.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const uploadedImages = [];
    if (images && images.length > 0) {
      for (const img of images) {
        try {
          // Verify if img has data:image prefix. If it's corrupted, this avoids sending garbage to Cloudinary.
          if (!img.startsWith("data:image")) {
            return res.status(400).json({ success: false, message: "Invalid image format uploaded" });
          }
          const upload = await cloudinary.uploader.upload(img, { timeout: 60000 });
          uploadedImages.push(upload.secure_url);
        } catch (uploadErr) {
          console.error("Cloudinary upload error:", uploadErr?.message || uploadErr);
          return res.status(500).json({ success: false, message: "Failed to upload image. Please try again." });
        }
      }
    }

    const newPet = new Pet({
      userId: user._id,
      images: uploadedImages,
      name,
      description,
      age: age || 0,
      breed,
      gender: gender || "unknown",
      color: color || "Unknown",
      type: type || "other",
      pincode: pincode || "000000",
      city: city || "Unknown",
      state: state || "Unknown",
      country: country || "Unknown",
      lastVaccinationDate
    });

    await newPet.save();

    return res.status(201).json({ success: true, message: "Pet created successfully", pet: newPet });
  } catch (error) {
    console.error("Error creating pet:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

const getPetsController = async (req, res) => {
  try {
    const { city } = req.query;
    let query = { isAdopted: false };

    if (city) {
      // Case-insensitive regex match for city
      query.city = { $regex: new RegExp(city, "i") };
    }

    const pets = await Pet.find(query).populate("userId", "name avatar email phoneNumber").sort({ createdAt: -1 });

    return res.status(200).json({ success: true, pets });
  } catch (error) {
    console.error("Error fetching pets:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPetController = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate("userId", "name avatar email phoneNumber");
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }
    return res.status(200).json({ success: true, pet });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPetDetailsController = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id).populate("userId", "name email avatar phoneNumber");
    if (!pet) {
      return res.status(404).json({ success: false, error: { message: "Pet not found" } });
    }
    return res.status(200).json({ success: true, data: { pet } });
  } catch (error) {
    console.error("Get pet details error:", error);
    return res.status(500).json({ success: false, error: { message: "Internal server error" } });
  }
};

const updatePetController = async (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
};

const deletePetController = async (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
};

module.exports = {
  createPetController,
  getPetsController,
  getPetController,
  getPetDetailsController,
  updatePetController,
  deletePetController
};
