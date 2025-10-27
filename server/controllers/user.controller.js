import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import ClientModel from "../models/client.model.js";
import UserModel from "../models/User.model.js";

export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      businessName,
      phone,
      email,
      password,
      confirmPassword,
      businessType,
      preferredPrintFormat,
      address,
      taxId,
      IsVerified,
    } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !name || !password || !businessName || !phone) {
      return res.status(422).json({ message: "Please fill all the fields" });
    }

    if (!emailRegex.test(email)) {
      return res.status(422).json({ message: "Invalid Email format" });
    }

    if (phone.length < 10 || phone.length > 10) {
      return res.status(422).json({ message: "Invalid Phone number" });
    }

    const newEmail = email.toLowerCase();

    const emailExists = await UserModel.findOne({ email: newEmail });

    if (emailExists) {
      return res.status(422).json({ message: "User with this email already exists" });
    }

    if (password.trim().length < 6) {
      return res
        .status(422)
        .json({ message: "Password must be at least 6 characters long" });
    }

    if (password != confirmPassword) {
      return res.status(422).json({ message: "Password do not match" });
    }

    const hashedPassword = await UserModel.hashPassword(password);

    const newUser = await UserModel.create({
      name,
      businessName,
      phone,
      email: newEmail,
      password: hashedPassword,
      businessType,
      preferredPrintFormat,
      address,
      taxId,
      IsVerified,
    });

    res.status(201).json(`New user ${newUser.email} registered successfully`);
  } catch (error) {
    console.error("Error in register user:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ message: "Please fill all the fields" });
    }

    const newEmail = email.toLowerCase();
    const user = await UserModel.findOne({ email: newEmail });
    if (!user) {
      return res.status(422).json({ error: "Invalid username or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(422).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res
      .status(200)
      .json({ user: userWithoutPassword, message: "Login Successful" });
  } catch (error) {
    console.error("Error in login user:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const id = req.user._id;

    const user = await UserModel.findById(id).select("-password");

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getProfile controller:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const editUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      businessName,
      phone,
      email,
      currentPassword,
      newPassword,
      confirmNewPassword,
      preferredPrintFormat,
      address,
      taxId,
      businessType,
    } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // === Email Validation & Update ===
    if (email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(422).json({ message: "Invalid email format." });
      }

      const emailExists = await UserModel.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: userId },
      });

      if (emailExists) {
        return res.status(422).json({ message: "Email already exists." });
      }

      user.email = email.trim().toLowerCase();
    }

    // === Basic Fields Update ===
    if (name?.trim()) user.name = name.trim();
    if (businessName?.trim()) user.businessName = businessName.trim();
    if (taxId?.trim()) user.taxId = taxId.trim();

    // === Phone Validation ===
    if (phone?.trim()) {
      const trimmedPhone = phone.trim();
      if (!/^\d{10}$/.test(trimmedPhone)) {
        return res.status(422).json({ message: "Invalid phone number." });
      }
      user.phone = trimmedPhone;
    }

    // === preferredPrintFormat Validation ===
    if (
      Array.isArray(preferredPrintFormat) &&
      preferredPrintFormat.every((val) => ["a4", "thermal"].includes(val))
    ) {
      user.preferredPrintFormat = preferredPrintFormat;
    }

    // === businessType Validation ===
    if (
      Array.isArray(businessType) &&
      businessType.every((val) =>
        [
          "finance",
          "crane-hiring",
          "erection & fabrication",
          "barber-salon",
          "food-stall",
          "general",
        ].includes(val)
      )
    ) {
      user.businessType = businessType;
    }

    // === Address Update ===
    if (address && typeof address === "object") {
      const { street, city, state, zipCode, country } = address;

      if (street?.trim()) user.address.street = street.trim();
      if (city?.trim()) user.address.city = city.trim();
      if (state?.trim()) user.address.state = state.trim();
      if (zipCode?.trim()) user.address.zipCode = zipCode.trim();
      if (country?.trim()) user.address.country = country.trim();
    }

    // === Password Update ===
    if (currentPassword || newPassword || confirmNewPassword) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({
          message:
            "Current password, new password, and confirm password are all required.",
        });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
          message: "New password and confirm password do not match.",
        });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect." });
      }

      user.password = await UserModel.hashPassword(newPassword);
    }

    // === Save Updated User ===
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Error in editUserProfile controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const addClient = async (req, res) => {
  try {
    const userId = req.user._id;

    const { companyName, address, email, phone, gstNumber, notes } = req.body;

    if (!companyName) {
      return res.status(400).json({ message: "Company name is required." });
    }

    // check for existing client with same name and email for this user
    const existingClient = await ClientModel.findOne({
      user: userId,
      companyName: companyName.trim(),
      email: email?.trim().toLowerCase(),
    });

    if (existingClient) {
      return res.status(409).json({ message: "Client already exists." });
    }

    // Create new client
    const newClient = new ClientModel({
      user: userId,
      companyName: companyName.trim(),
      address: {
        street: address.street?.trim(),
        city: address.city?.trim(),
        state: address.state?.trim(),
        zipCode: address.zipCode?.trim(),
        country: address.country?.trim() || "India",
      },
      email: email?.trim().toLowerCase(),
      phone: phone?.trim(),
      gstNumber: gstNumber?.trim(),
      notes: notes?.trim(),
    });

    await newClient.save();

    return res.status(201).json({
      message: "Client added successfully.",
      client: newClient,
    });
  } catch (error) {
    console.log("Error in AddClient controller:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const editClient = async (req, res) => {
  try {
    const userId = req.user._id;
    const clientId = req.params.id;

    const { companyName, address, email, phone, gstNumber, notes } = req.body;

    // Fetch the client
    const client = await ClientModel.findOne({ _id: clientId, user: userId });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Update fields if they exist
    if (companyName?.trim()) client.companyName = companyName.trim();

    if (email?.trim()) {
      client.email = email.trim().toLowerCase();
    }

    if (phone?.trim()) client.phone = phone.trim();
    if (gstNumber?.trim()) client.gstNumber = gstNumber.trim();
    if (notes?.trim()) client.notes = notes.trim();

    // Update nested address if provided
    if (address) {
      if (address.street?.trim()) client.address.street = address.street.trim();
      if (address.city?.trim()) client.address.city = address.city.trim();
      if (address.state?.trim()) client.address.state = address.state.trim();
      if (address.zipCode?.trim())
        client.address.zipCode = address.zipCode.trim();
      if (address.country?.trim())
        client.address.country = address.country.trim();
    }

    await client.save();

    return res.status(200).json({
      message: "Client updated successfully.",
      client,
    });
  } catch (error) {
    console.log("Error in editClient controller:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getClientById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    // Fetch the client belonging to the user
    const client = await ClientModel.findOne({ _id: clientId, user: userId });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ client });

  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserClients = async (req, res) => {
  try {
    const userId = req.user._id;

    const clients = await ClientModel.find({ user: userId });

    res.status(200).json({
      message: "Clients fetched successfully",
      clients,
    });
  } catch (error) {
    console.error("Error in getAllClients:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const userId = req.user._id;
    const { clientId } = req.params;

    // Check if client exists and belongs to the user
    const client = await ClientModel.findOne({ _id: clientId, user: userId });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Delete the client
    await ClientModel.deleteOne({ _id: clientId, user: userId });

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error in deleteClient:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const addBankDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      bankName,
      accountNumber,
      accountHolderName,
      ifscCode,
      branchName,
      accountType,
      upiId
    } = req.body;

    // Validation
    if (!bankName || !accountNumber || !accountHolderName || !ifscCode) {
      return res.status(400).json({
        message: "Bank name, account number, account holder name, and IFSC code are required"
      });
    }

    // IFSC code validation (basic format)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.toUpperCase())) {
      return res.status(400).json({
        message: "Invalid IFSC code format"
      });
    }

    // Account number validation
    if (!/^\d{9,18}$/.test(accountNumber)) {
      return res.status(400).json({
        message: "Account number must be between 9-18 digits"
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update bank details
    user.bankDetails = {
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolderName: accountHolderName.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      branchName: branchName?.trim(),
      accountType: accountType || "savings",
      upiId: upiId?.trim()
    };

    await user.save();

    res.status(200).json({
      message: "Bank details added successfully",
      bankDetails: user.bankDetails
    });
  } catch (error) {
    console.error("Error in addBankDetails:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBankDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findById(userId).select("bankDetails");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      bankDetails: user.bankDetails || null
    });
  } catch (error) {
    console.error("Error in getBankDetails:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateBankDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      bankName,
      accountNumber,
      accountHolderName,
      ifscCode,
      branchName,
      accountType,
      upiId
    } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if bank details exist
    if (!user.bankDetails) {
      return res.status(404).json({ message: "Bank details not found. Please add bank details first." });
    }

    // Update only provided fields
    if (bankName) user.bankDetails.bankName = bankName.trim();
    if (accountNumber) {
      if (!/^\d{9,18}$/.test(accountNumber)) {
        return res.status(400).json({
          message: "Account number must be between 9-18 digits"
        });
      }
      user.bankDetails.accountNumber = accountNumber.trim();
    }
    if (accountHolderName) user.bankDetails.accountHolderName = accountHolderName.trim();
    if (ifscCode) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(ifscCode.toUpperCase())) {
        return res.status(400).json({
          message: "Invalid IFSC code format"
        });
      }
      user.bankDetails.ifscCode = ifscCode.trim().toUpperCase();
    }
    if (branchName) user.bankDetails.branchName = branchName.trim();
    if (accountType) user.bankDetails.accountType = accountType;
    if (upiId !== undefined) user.bankDetails.upiId = upiId?.trim();

    await user.save();

    res.status(200).json({
      message: "Bank details updated successfully",
      bankDetails: user.bankDetails
    });
  } catch (error) {
    console.error("Error in updateBankDetails:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteBankDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.bankDetails) {
      return res.status(404).json({ message: "Bank details not found" });
    }

    user.bankDetails = undefined;
    await user.save();

    res.status(200).json({
      message: "Bank details deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteBankDetails:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
