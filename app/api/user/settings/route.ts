import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch user settings from database
    const userSettings = await db
      .select({
        emailNotificationsEnabled: users.emailNotificationsEnabled,
      })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (userSettings.length === 0) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    return new NextResponse(
      JSON.stringify({
        emailNotificationsEnabled: userSettings[0].emailNotificationsEnabled,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Settings fetch error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateSettingsSchema.parse(body);

    // Update user settings in database
    const [updatedUser] = await db
      .update(users)
      .set({
        emailNotificationsEnabled: validatedData.emailNotifications,
        updatedAt: new Date(),
      })
      .where(eq(users.email, session.user.email))
      .returning();

    return new NextResponse(
      JSON.stringify({
        success: true,
        emailNotificationsEnabled: updatedUser.emailNotificationsEnabled,
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }

    console.error("Settings update error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
