import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    // 1. Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // 2. Credentials Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const isMatch = await user.matchPassword(credentials.password);

        if (!isMatch) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar, // Maps DB 'avatar' to NextAuth 'image'
          avatar: user.avatar, // Explicitly pass avatar
          role: user.role,
          savedNotes: user.savedNotes?.map(id => id.toString()) || [], 
        };
      }
    })
  ],
  callbacks: {
    // 1. SignIn: Handle Google User Creation & Database Sync
    async signIn({ user, account }) {
      if (account.provider === "google") {
        await connectDB();
        try {
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user if they don't exist
            existingUser = new User({
              name: user.name,
              email: user.email,
              avatar: user.image, // Save Google image as avatar
              role: 'user',
              savedNotes: [],
            });
            await existingUser.save();
          } else {
            // FIX: If user exists but has no avatar, sync it from Google!
            if (!existingUser.avatar && user.image) {
              existingUser.avatar = user.image;
              await existingUser.save();
            }
          }

          // FIX: explicitly attach the avatar to the NextAuth 'user' object
          // so it safely passes into the JWT callback below.
          user.id = existingUser._id.toString();
          user.role = existingUser.role;
          user.avatar = existingUser.avatar || user.image; 
          user.image = existingUser.avatar || user.image; 
          user.savedNotes = existingUser.savedNotes?.map(id => id.toString()) || [];
          
          return true;
        } catch (error) {
          console.error("Error creating user from Google Login:", error);
          return false;
        }
      }
      return true; 
    },

    // 2. JWT: Persist User ID, Role, Avatar, and SavedNotes into the Token
    async jwt({ token, user, trigger, session }) {
      // Initial Sign In
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // Prioritize our custom avatar field, fallback to default image
        token.picture = user.avatar || user.image; 
        token.savedNotes = user.savedNotes || []; 
      }
      
      // Handle Session Updates
      if (trigger === "update" && session?.user) {
        if (session.user.image || session.user.avatar) {
            token.picture = session.user.avatar || session.user.image; 
        }
        if (session.user.name) {
          token.name = session.user.name;
        }
        if (session.user.savedNotes) {
          token.savedNotes = session.user.savedNotes;
        }
      }
      
      return token;
    },

    // 3. Session: Expose User ID, Role, Avatar, and SavedNotes to the Client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        // FIX: Map the token picture to BOTH image and avatar so your UI components 
        // can use session.user.avatar safely anywhere!
        session.user.image = token.picture; 
        session.user.avatar = token.picture; 
        session.user.savedNotes = token.savedNotes || []; 
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  secret: process.env.NEXTAUTH_SECRET,
};