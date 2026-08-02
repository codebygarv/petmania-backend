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

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email before adding a pet" });
    }

    if (!user.isAdharVerified && !user.userVerified) {
      return res.status(403).json({
        success: false,
        message: "Identity / Aadhaar verification is required before you can create a pet listing. Please complete profile verification."
      });
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
    const { city, search, type, gender, minAge, maxAge } = req.query;
    let query = { isAdopted: false, isApproved: true };

    if (city) {
      // Case-insensitive regex match for city
      query.city = { $regex: new RegExp(city, "i") };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { breed: { $regex: search, $options: "i" } },
      ];
    }

    if (type && type !== "all") {
      query.type = type.toLowerCase();
    }

    if (gender && gender !== "all" && gender !== "any") {
      query.gender = gender.toLowerCase();
    }

    if (minAge !== undefined || maxAge !== undefined) {
      query.age = {};
      if (minAge !== undefined && minAge !== "") query.age.$gte = Number(minAge);
      if (maxAge !== undefined && maxAge !== "") query.age.$lte = Number(maxAge);
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

const getMyPetsController = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.email?.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const pets = await Pet.find({ userId: user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, pets });
  } catch (error) {
    console.error("Error fetching my pets:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const markAdoptedController = async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }
    pet.isAdopted = true;
    pet.adoptedDate = new Date();
    await pet.save();
    return res.status(200).json({ success: true, pet });
  } catch (error) {
    console.error("Error marking pet as adopted:", error);
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
  try {
    const { id } = req.params;
    const { name, description, age, breed, gender, color, type, pincode, city, state, country, lastVaccinationDate } = req.body;

    const user = await User.findOne({ email: req.email?.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }
    if (pet.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this pet" });
    }

    if (name !== undefined) pet.name = name;
    if (description !== undefined) pet.description = description;
    if (age !== undefined) pet.age = age;
    if (breed !== undefined) pet.breed = breed;
    if (gender !== undefined) pet.gender = gender;
    if (color !== undefined) pet.color = color;
    if (type !== undefined) pet.type = type;
    if (pincode !== undefined) pet.pincode = pincode;
    if (city !== undefined) pet.city = city;
    if (state !== undefined) pet.state = state;
    if (country !== undefined) pet.country = country;
    if (lastVaccinationDate !== undefined) pet.lastVaccinationDate = lastVaccinationDate;

    await pet.save();
    return res.status(200).json({ success: true, message: "Pet updated successfully", pet });
  } catch (error) {
    console.error("Error updating pet:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deletePetController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ email: req.email?.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }
    // Check ownership
    if (pet.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this pet" });
    }
    await Pet.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Pet deleted successfully" });
  } catch (error) {
    console.error("Error deleting pet:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createPetController,
  getPetsController,
  getPetController,
  getMyPetsController,
  getPetDetailsController,
  markAdoptedController,
  updatePetController,
  deletePetController
};
