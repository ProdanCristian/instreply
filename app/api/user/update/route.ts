import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(30, "Name must not be longer than 30 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);

    // Check if email is being changed and if it's already taken
    if (validatedData.email !== session.user.email) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, validatedData.email))
        .limit(1);

      if (existingUser.length > 0) {
        return new NextResponse(
          JSON.stringify({ error: "Email already taken" }),
          { status: 400 }
        );
      }
    }

    // Update user in database
    const [updatedUser] = await db
      .update(users)
      .set({
        name: validatedData.name,
        email: validatedData.email,
        updatedAt: new Date(),
      })
      .where(eq(users.email, session.user.email))
      .returning();

    return new NextResponse(
      JSON.stringify({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        emailVerified: updatedUser.emailVerified,
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
