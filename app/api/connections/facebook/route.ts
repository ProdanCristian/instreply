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
      const appId = process.env.FACEBOOK_APP_ID;
      const redirectUri = `${process.env.NEXTAUTH_URL}/api/connections/facebook`;

      if (!appId || !redirectUri) {
        return NextResponse.json(
          { error: "Facebook API credentials not configured" },
          { status: 500 }
        );
      }

      const scopes = [
        "pages_show_list",
        "pages_read_engagement",
        "pages_manage_metadata",
        "pages_manage_posts",
        "pages_manage_engagement",
        "pages_messaging",
        "public_profile",
      ].join(",");

      const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
        process.env.FACEBOOK_REDIRECT_URI || redirectUri
      )}&scope=${encodeURIComponent(
        scopes
      )}&response_type=code&state=facebook_page_connection`;

      return NextResponse.redirect(facebookAuthUrl);
    } catch (error) {
      console.error("Error initiating Facebook connection:", error);
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
        console.error("Facebook authorization error:", error);
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
      const appId = process.env.FACEBOOK_APP_ID;
      const appSecret = process.env.FACEBOOK_APP_SECRET;
      const redirectUri = `${process.env.NEXTAUTH_URL}/api/connections/facebook`;
      const registeredRedirectUri =
        process.env.FACEBOOK_REDIRECT_URI || redirectUri;

      if (!appId || !appSecret || !registeredRedirectUri) {
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=config_error",
            process.env.NEXTAUTH_URL
          )
        );
      }

      // Exchange code for access token
      const tokenResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
          registeredRedirectUri
        )}&client_secret=${appSecret}&code=${code}`,
        {
          method: "GET",
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

      // Get user info (verification that the token works)
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${accessToken}`
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

      // Get pages that the user manages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,picture,access_token&access_token=${accessToken}`
      );

      if (!pagesResponse.ok) {
        console.error("Failed to get pages info:", await pagesResponse.text());
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=pages_info",
            process.env.NEXTAUTH_URL
          )
        );
      }

      const pagesData = await pagesResponse.json();

      if (!pagesData.data || pagesData.data.length === 0) {
        return NextResponse.redirect(
          new URL(
            "/dashboard/connections?error=no_pages",
            process.env.NEXTAUTH_URL
          )
        );
      }

      // For now, use the first page (could be extended to let the user choose)
      const page = pagesData.data[0];
      const pageAccessToken = page.access_token;
      const pageId = page.id;
      const pageName = page.name;
      const pageProfilePic =
        page.picture?.data?.url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          pageName
        )}&size=150&background=1877F2&color=fff`;

      // Get long-lived page token
      const longLivedTokenResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${pageAccessToken}`
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
      const longLivedPageToken = longLivedTokenData.access_token;

      const existingConnection = await db
        .select()
        .from(socialConnections)
        .where(
          and(
            eq(socialConnections.userId, userId),
            eq(socialConnections.platform, "FACEBOOK")
          )
        )
        .limit(1);

      if (existingConnection.length > 0) {
        await db
          .update(socialConnections)
          .set({
            accessToken: longLivedPageToken,
            platformUserId: pageId,
            platformUserName: pageName,
            platformUserAvatar: pageProfilePic,
            updatedAt: new Date(),
          })
          .where(eq(socialConnections.id, existingConnection[0].id));
      } else {
        await db.insert(socialConnections).values({
          userId,
          platform: "FACEBOOK",
          accessToken: longLivedPageToken,
          platformUserId: pageId,
          platformUserName: pageName,
          platformUserAvatar: pageProfilePic,
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
      console.error("Error processing Facebook callback:", error);

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
    console.log("Facebook disconnection initiated");
    const session = await getServerSession();

    if (!session?.user?.email) {
      console.log("Facebook disconnection - unauthorized (no session)");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!userResult.length) {
      console.log("Facebook disconnection - user not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;
    console.log(
      `Facebook disconnection - attempting to delete for user ID: ${userId}`
    );

    // Get the connection to revoke the token
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
          eq(socialConnections.platform, "FACEBOOK")
        )
      )
      .limit(1);

    if (connectionResult.length) {
      try {
        // For Facebook apps, we'll simply remove the database entry
        // The token will expire naturally over time
        console.log(
          "Facebook token will expire naturally - DB connection removed"
        );
      } catch (error) {
        console.error("Error handling Facebook disconnection:", error);
      }
    }

    const result = await db
      .delete(socialConnections)
      .where(
        and(
          eq(socialConnections.userId, userId),
          eq(socialConnections.platform, "FACEBOOK")
        )
      );

    console.log(`Facebook disconnection successful: ${JSON.stringify(result)}`);
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
    console.error("Error disconnecting Facebook:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Facebook" },
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
