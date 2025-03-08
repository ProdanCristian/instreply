import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { socialConnections, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (!code) {
    try {
      const clientKey = process.env.TIKTOK_CLIENT_KEY;
      const redirectUri =
        process.env.TIKTOK_REDIRECT_URI ||
        `${process.env.NEXTAUTH_URL}/api/connections/tiktok`;

      if (!clientKey || !redirectUri) {
        return NextResponse.json(
          { error: "TikTok API credentials not configured" },
          { status: 500 }
        );
      }

      // Create a CSRF state token
      const csrfState = randomBytes(16).toString("hex");

      const scope = "user.info.basic,video.list";

      // TikTok v2 Login Kit authorization URL
      const tiktokAuthUrl =
        `https://www.tiktok.com/v2/auth/authorize/` +
        `?client_key=${clientKey}` +
        `&scope=${encodeURIComponent(scope)}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${csrfState}`;

      return NextResponse.redirect(tiktokAuthUrl);
    } catch (error) {
      console.error("Error initiating TikTok connection:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  } else {
    try {
      // Check if there was an error in the authorization
      if (error) {
        console.error(
          `TikTok authorization error: ${error} - ${errorDescription}`
        );
        return NextResponse.redirect(
          new URL(
            `/dashboard/connections?error=${error}&error_description=${errorDescription}`,
            process.env.NEXTAUTH_URL
          )
        );
      }

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
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=user_not_found",
            process.env.NEXTAUTH_URL
          )
        );
      }

      const userId = userResult[0].id;
      const clientKey = process.env.TIKTOK_CLIENT_KEY;
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
      const redirectUri =
        process.env.TIKTOK_REDIRECT_URI ||
        `${process.env.NEXTAUTH_URL}/api/connections/tiktok`;

      if (!clientKey || !clientSecret || !redirectUri) {
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=config_error",
            process.env.NEXTAUTH_URL
          )
        );
      }

      // Exchange code for access token using v2 endpoint
      const tokenResponse = await fetch(
        "https://open.tiktokapis.com/v2/oauth/token/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_key: clientKey,
            client_secret: clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          }).toString(),
        }
      );

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error(
          "Failed to exchange code for token:",
          JSON.stringify(tokenData)
        );
        return NextResponse.redirect(
          new URL(
            `/dashboard/connections?error=token_exchange&details=${encodeURIComponent(
              JSON.stringify(tokenData)
            )}`,
            process.env.NEXTAUTH_URL
          )
        );
      }

      if (!tokenData.access_token) {
        console.error("Invalid token response:", tokenData);
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=invalid_token",
            process.env.NEXTAUTH_URL
          )
        );
      }

      const accessToken = tokenData.access_token;
      const openId = tokenData.open_id;

      // Get user info using v2 endpoint
      const userInfoResponse = await fetch(
        "https://open.tiktokapis.com/v2/user/info/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
        }
      );

      const userInfoData = await userInfoResponse.json();

      if (!userInfoResponse.ok) {
        console.error("Failed to get user info:", JSON.stringify(userInfoData));
        return NextResponse.redirect(
          new URL(
            `/dashboard/connections?error=user_info&details=${encodeURIComponent(
              JSON.stringify(userInfoData)
            )}`,
            process.env.NEXTAUTH_URL
          )
        );
      }

      if (!userInfoData.data || !userInfoData.data.user) {
        console.error("Invalid user info response:", userInfoData);
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=invalid_user_info",
            process.env.NEXTAUTH_URL
          )
        );
      }

      const username =
        userInfoData.data.user.display_name ||
        userInfoData.data.user.username ||
        openId;
      let profilePicUrl = userInfoData.data.user.avatar_url;

      if (!profilePicUrl) {
        profilePicUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          username
        )}&size=150&background=000000&color=fff`;
      }

      const existingConnection = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.userId, userId),
            eq(socialConnections.platform, "TIKTOK")
          )
        )
        .limit(1);

      // Store refresh token info in a comment for future reference
      // Refresh token: ${tokenData.refresh_token}, Expires in: ${tokenData.expires_in}

      if (existingConnection.length > 0) {
        await db
          .update(socialConnections)
          .set({
            accessToken,
            platformUserId: openId,
            platformUserName: username,
            platformUserAvatar: profilePicUrl,
            updatedAt: new Date(),
          })
          .where(eq(socialConnections.id, existingConnection[0].id));
      } else {
        await db.insert(socialConnections).values({
          userId,
          platform: "TIKTOK",
          accessToken,
          platformUserId: openId,
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
      console.error("Error processing TikTok callback:", error);

      return new Response(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    window.location.replace("/dashboard/connections?error=server_error&t=${Date.now()}");
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
    }
  }
}

export async function DELETE() {
  try {
    console.log("TikTok disconnection initiated");
    const session = await getServerSession();

    if (!session?.user?.email) {
      console.log("TikTok disconnection - unauthorized (no session)");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!userResult.length) {
      console.log("TikTok disconnection - user not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;
    console.log(
      `TikTok disconnection - attempting to delete for user ID: ${userId}`
    );

    const connectionResult = await db
      .select({
        id: socialConnections.id,
        accessToken: socialConnections.accessToken,
      })
      .from(socialConnections)
      .where(
        and(
          eq(socialConnections.userId, userId),
          eq(socialConnections.platform, "TIKTOK")
        )
      )
      .limit(1);

    if (connectionResult.length) {
      try {
        // For TikTok, we'll simply remove the database entry
        // The token will expire naturally over time
        console.log(
          "TikTok token will expire naturally - DB connection removed"
        );
      } catch (error) {
        console.error("Error handling TikTok disconnection:", error);
      }
    }

    const result = await db
      .delete(socialConnections)
      .where(
        and(
          eq(socialConnections.userId, userId),
          eq(socialConnections.platform, "TIKTOK")
        )
      );

    console.log(`TikTok disconnection successful: ${JSON.stringify(result)}`);
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
    console.error("Error disconnecting TikTok:", error);
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

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
