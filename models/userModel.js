import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  twoFactorAuth: {
    type: String,
    default: null,
  },
  twoFactorEnabled: { 
    type: Boolean,
    default: false,
  },
  twoFactorCode: { 
    type: String,
    default: null,
  },
  twoFactorExpiry: { 
    type: Date,
    default: null,
  },
}, { timestamps: true });

const userModel = mongoose.model("User", userSchema);

export default userModel;
