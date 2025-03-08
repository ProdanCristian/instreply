import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { socialConnections, users } from "@/lib/schema";
import { eq } from "drizzle-orm";

interface SocialConnection {
  platformUserId: string;
  platformUserName: string;
  platformUserAvatar: string;
}

interface Connections {
  instagram: SocialConnection | null;
  facebook: SocialConnection | null;
  tiktok: SocialConnection | null;
  threads: SocialConnection | null;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    const connections = await db
      .select({
        platform: socialConnections.platform,
        platformUserId: socialConnections.platformUserId,
        platformUserName: socialConnections.platformUserName,
        platformUserAvatar: socialConnections.platformUserAvatar,
      })
      .from(socialConnections)
      .where(eq(socialConnections.userId, userId));

    const formattedConnections: Connections = {
      instagram: null,
      facebook: null,
      tiktok: null,
      threads: null,
    };

    connections.forEach((connection) => {
      const platform = connection.platform.toLowerCase() as keyof Connections;
      if (platform in formattedConnections) {
        formattedConnections[platform] = {
          platformUserId: connection.platformUserId,
          platformUserName: connection.platformUserName || "",
          platformUserAvatar: connection.platformUserAvatar || "",
        };
      }
    });

    return NextResponse.json(formattedConnections, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
