"use server";

import connectDB from "@/lib/db";
import User from "@/lib/models/User";

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

    // 🚀 THE FIX: Pass the plain-text password directly. 
    // Mongoose's pre('save') hook will hash it exactly once.
    const newUser = new User({
      name,
      email,
      password, // <--- Plain text goes here
    });

    await newUser.save(); // <--- Mongoose hashes it here
    
    return { success: true };
  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error: "Something went wrong during registration" };
  }
}