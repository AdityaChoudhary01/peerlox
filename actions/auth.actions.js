"use server";

import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function registerUser(formData) {
  await connectDB();

  try {
    const { name, email, password } = formData;

    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" };
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: "Email is already registered" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    return { success: true };
  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error: "Something went wrong during registration" };
  }
}