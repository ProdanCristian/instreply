import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { socialConnections, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const isTest = searchParams.get("test") === "true";

  if (isTest) {
    try {
      const session = await getServerSession();

      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json({ message: "Test mode activated" });
    } catch (error) {
      console.error("Error in test mode:", error);
      return NextResponse.json({ error: "Test mode error" }, { status: 500 });
    }
  }

  if (!code) {
    try {
      const appId = process.env.THREADS_APP_ID;
      const redirectUri = `${process.env.NEXTAUTH_URL}/api/connections/threads`;

      if (!appId || !redirectUri) {
        return NextResponse.json(
          { error: "Threads API credentials not configured" },
          { status: 500 }
        );
      }

      const scopes = [
        "threads_basic",
        "threads_content_publish",
        "threads_manage_insights",
        "threads_manage_replies",
        "threads_read_replies",
      ].join(",");

      const threadsAuthUrl = `https://www.threads.net/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(
        process.env.THREADS_REDIRECT_URI || redirectUri
      )}&scope=${encodeURIComponent(scopes)}&response_type=code`;

      return NextResponse.redirect(threadsAuthUrl);
    } catch (error) {
      console.error("Error initiating Threads connection:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  } else {
    try {
      const session = await getServerSession();

      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const error = searchParams.get("error");

      if (error) {
        console.error("Threads authorization error:", error);
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=auth_failed",
            process.env.NEXTAUTH_URL
          )
        );
      }

      const userResult = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);

      if (!userResult.length) {
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=user_not_found",
            process.env.NEXTAUTH_URL
          )
        );
      }

      const userId = userResult[0].id;
      const appId = process.env.THREADS_APP_ID;
      const appSecret = process.env.THREADS_APP_SECRET;
      const redirectUri = `${process.env.NEXTAUTH_URL}/api/connections/threads`;
      const registeredRedirectUri =
        process.env.THREADS_REDIRECT_URI || redirectUri;

      if (!appId || !appSecret || !registeredRedirectUri) {
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=config_error",
            process.env.NEXTAUTH_URL
          )
        );
      }

      const tokenResponse = await fetch(
        "https://graph.threads.net/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: appId,
            client_secret: appSecret,
            grant_type: "authorization_code",
            redirect_uri: registeredRedirectUri,
            code,
          }),
        }
      );

      if (!tokenResponse.ok) {
        console.error(
          "Failed to exchange code for token:",
          await tokenResponse.text()
        );
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=token_exchange",
            process.env.NEXTAUTH_URL
          )
        );
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      const threadsUserId = tokenData.user_id;

      const userInfoResponse = await fetch(
        `https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url,threads_biography&access_token=${accessToken}`
      );

      if (!userInfoResponse.ok) {
        console.error(
          "Failed to get user info:",
          await userInfoResponse.text()
        );
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=user_info",
            process.env.NEXTAUTH_URL
          )
        );
      }

      const userInfo = await userInfoResponse.json();
      const username = userInfo.username;
      const displayName = userInfo.name || username;

      let profilePicUrl = userInfo.threads_profile_picture_url;

      if (!profilePicUrl) {
        profilePicUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName
        )}&size=150&background=101010&color=fff`;
      }

      const existingConnection = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.userId, userId),
            eq(socialConnections.platform, "THREADS")
          )
        )
        .limit(1);

      if (existingConnection.length > 0) {
        await db
          .update(socialConnections)
          .set({
            accessToken,
            platformUserId: threadsUserId,
            platformUserName: username,
            platformUserAvatar: profilePicUrl,
            updatedAt: new Date(),
          })
          .where(eq(socialConnections.id, existingConnection[0].id));
      } else {
        await db.insert(socialConnections).values({
          userId,
          platform: "THREADS",
          accessToken,
          platformUserId: threadsUserId,
          platformUserName: username,
          platformUserAvatar: profilePicUrl,
        });
      }

      return new Response(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    window.location.replace("/dashboard/connections?success=true&t=${Date.now()}");
  </script>
</head>
<body>
</body>
</html>`,
        {
          headers: {
            "Content-Type": "text/html",
            "Cache-Control": "no-store, private",
            Pragma: "no-cache",
          },
        }
      );
    } catch (error) {
      console.error("Error processing Threads callback:", error);

      return NextResponse.redirect(
        new URL(
          `/dashboard/connections?error=${encodeURIComponent(
            error instanceof Error ? error.message : "Unknown error"
          )}`,
          process.env.NEXTAUTH_URL
        )
      );
    }
  }
}

export async function DELETE() {
  try {
    console.log("Threads disconnection initiated");
    const session = await getServerSession();

    if (!session?.user?.email) {
      console.log("Threads disconnection - unauthorized (no session)");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!userResult.length) {
      console.log("Threads disconnection - user not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;
    console.log(
      `Threads disconnection - attempting to delete for user ID: ${userId}`
    );

    const connectionResult = await db
      .select({
        id: socialConnections.id,
        accessToken: socialConnections.accessToken,
        platformUserId: socialConnections.platformUserId,
      })
      .from(socialConnections)
      .where(
        and(
          eq(socialConnections.userId, userId),
          eq(socialConnections.platform, "THREADS")
        )
      )
      .limit(1);

    if (connectionResult.length) {
      try {
        // For Threads apps, we'll simply remove the database entry
        // The token will expire naturally over time
        console.log(
          "Threads token will expire naturally - DB connection removed"
        );
      } catch (error) {
        console.error("Error handling Threads disconnection:", error);
      }
    }

    const result = await db
      .delete(socialConnections)
      .where(
        and(
          eq(socialConnections.userId, userId),
          eq(socialConnections.platform, "THREADS")
        )
      );

    console.log(`Threads disconnection successful: ${JSON.stringify(result)}`);
    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("Error disconnecting Threads:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}
