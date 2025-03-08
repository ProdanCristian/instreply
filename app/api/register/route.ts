import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      // Check which provider they used and return appropriate message
      if (existingUser.authProvider === "google") {
        return NextResponse.json(
          {
            error:
              "This email is already registered with Google. Please sign in with Google.",
          },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          {
            error:
              "This email is already registered. Please sign in with your password.",
          },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        authProvider: "credentials",
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    // Create verification token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      expires,
    });

    // TODO: Send verification email
    // You'll need to implement email sending logic here
    // For now, we'll just return the token in the response
    // In production, you should send this via email

    return NextResponse.json(
      {
        user: newUser,
        message:
          "User registered successfully. Please check your email to verify your account.",
        redirect: "/dashboard",
        verificationToken: token, // Remove this in production
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
