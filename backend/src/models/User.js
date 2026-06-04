import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const UserRole = Object.freeze({
  PASSENGER: "passenger",
  DRIVER: "driver",
  ADMIN: "admin",
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.PASSENGER,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    stripeCustomerId: { type: String, index: true, sparse: true },
    disabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 12);
};

userSchema.set("toJSON", {
  versionKey: false,
  transform(_doc, ret) {
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
