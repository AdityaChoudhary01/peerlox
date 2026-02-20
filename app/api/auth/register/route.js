import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Please provide all fields." },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: "User already exists." },
        { status: 400 }
      );
    }

    // 2. Reserved Name Check (From your old code)
    // Note: In Next.js env vars are accessed via process.env
    const reservedName = process.env.MAIN_ADMIN_NAME || '';
    if (reservedName && name.toLowerCase().replace(/\s+/g, '') === reservedName.toLowerCase().replace(/\s+/g, '')) {
        if (email !== process.env.MAIN_ADMIN_EMAIL) {
            return NextResponse.json({ message: 'This name is reserved.' }, { status: 400 });
        }
    }

    // 3. Generate Avatar (Same logic as before)
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

    // 4. Create User
    // Password hashing happens automatically in the User model pre('save') hook
    await User.create({
      name,
      email,
      password,
      avatar: avatarUrl,
    });

    return NextResponse.json({ message: "User registered successfully." }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "An error occurred while registering." },
      { status: 500 }
    );
  }
}