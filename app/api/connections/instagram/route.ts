import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { socialConnections, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    try {
      const appId = process.env.INSTAGRAM_APP_ID;
      const redirectUri = `${process.env.NEXTAUTH_URL}/api/connections/instagram`;

      if (!appId || !redirectUri) {
        return NextResponse.json(
          { error: "Instagram API credentials not configured" },
          { status: 500 }
        );
      }

      const scopes = [
        "instagram_business_basic",
        "instagram_business_content_publish",
        "instagram_business_manage_messages",
        "instagram_business_manage_comments",
      ].join(",");

      const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(
        process.env.INSTAGRAM_REDIRECT_URI || redirectUri
      )}&scope=${encodeURIComponent(scopes)}&response_type=code`;

      return NextResponse.redirect(instagramAuthUrl);
    } catch (error) {
      console.error("Error initiating Instagram connection:", error);
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
        console.error("Instagram authorization error:", error);
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
      const appId = process.env.INSTAGRAM_APP_ID;
      const appSecret = process.env.INSTAGRAM_APP_SECRET;
      const redirectUri = `${process.env.NEXTAUTH_URL}/api/connections/instagram/business`;
      const registeredRedirectUri =
        process.env.INSTAGRAM_REDIRECT_URI || redirectUri;

      if (!appId || !appSecret || !registeredRedirectUri) {
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=config_error",
            process.env.NEXTAUTH_URL
          )
        );
      }

      const tokenResponse = await fetch(
        "https://api.instagram.com/oauth/access_token",
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
      const shortLivedToken = tokenData.access_token;
      const instagramUserId = tokenData.user_id;

      const longLivedTokenResponse = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`
      );

      if (!longLivedTokenResponse.ok) {
        console.error(
          "Failed to get long-lived token:",
          await longLivedTokenResponse.text()
        );
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=long_lived_token",
            process.env.NEXTAUTH_URL
          )
        );
      }

      const longLivedTokenData = await longLivedTokenResponse.json();
      const accessToken = longLivedTokenData.access_token;

      const userInfoResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,profile_picture_url&access_token=${accessToken}`
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

      let profilePicUrl = userInfo.profile_picture_url;

      if (!profilePicUrl) {
        profilePicUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          username
        )}&size=150&background=5851DB&color=fff`;
      }

      const existingConnection = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.userId, userId),
            eq(socialConnections.platform, "INSTAGRAM")
          )
        )
        .limit(1);

      if (existingConnection.length > 0) {
        await db
          .update(socialConnections)
          .set({
            accessToken,
            platformUserId: instagramUserId,
            platformUserName: username,
            platformUserAvatar: profilePicUrl,
            updatedAt: new Date(),
          })
          .where(eq(socialConnections.id, existingConnection[0].id));
      } else {
        await db.insert(socialConnections).values({
          userId,
          platform: "INSTAGRAM",
          accessToken,
          platformUserId: instagramUserId,
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
      console.error("Error processing Instagram callback:", error);

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
    console.log("Instagram disconnection initiated");
    const session = await getServerSession();

    if (!session?.user?.email) {
      console.log("Instagram disconnection - unauthorized (no session)");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!userResult.length) {
      console.log("Instagram disconnection - user not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;
    console.log(
      `Instagram disconnection - attempting to delete for user ID: ${userId}`
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
          eq(socialConnections.platform, "INSTAGRAM")
        )
      )
      .limit(1);

    if (connectionResult.length) {
      try {
        // With Instagram API, we can't directly revoke tokens
        // Instead, we just delete the DB entry and let the token expire naturally
        console.log(
          "Instagram token will expire naturally - DB connection removed"
        );
      } catch (error) {
        console.error("Error handling Instagram disconnection:", error);
      }
    }

    const result = await db
      .delete(socialConnections)
      .where(
        and(
          eq(socialConnections.userId, userId),
          eq(socialConnections.platform, "INSTAGRAM")
        )
      );

    console.log(
      `Instagram disconnection successful: ${JSON.stringify(result)}`
    );
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
    console.error("Error disconnecting Instagram:", error);
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
