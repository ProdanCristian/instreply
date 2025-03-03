import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import db from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { users, accounts } from "@/lib/schema";

// For debugging
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log(
  "Google Client Secret:",
  process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set"
);
console.log("Apple Client ID:", process.env.APPLE_CLIENT_ID);
console.log(
  "Apple Client Secret:",
  process.env.APPLE_CLIENT_SECRET ? "Set" : "Not set"
);
console.log("Facebook Client ID:", process.env.FACEBOOK_CLIENT_ID);
console.log(
  "Facebook Client Secret:",
  process.env.FACEBOOK_CLIENT_SECRET ? "Set" : "Not set"
);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });

        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name || "",
        };
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  callbacks: {
    async signIn({ user, account }) {
      // For social logins
      if (
        account?.provider === "google" ||
        account?.provider === "apple" ||
        account?.provider === "facebook"
      ) {
        if (!user.email) {
          return false;
        }

        // Check if user exists
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (existingUser) {
          // Check if this social account is already linked to the user
          const existingAccount = await db.query.accounts.findFirst({
            where: and(
              eq(accounts.userId, existingUser.id),
              eq(accounts.provider, account.provider),
              eq(accounts.providerAccountId, account.providerAccountId)
            ),
          });

          if (!existingAccount) {
            // Link the social account to the existing user
            await db.insert(accounts).values({
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at,
              tokenType: account.token_type,
              scope: account.scope,
              idToken: account.id_token,
            });
          }

          return true;
        } else {
          // Create a new user
          const [newUser] = await db
            .insert(users)
            .values({
              name: user.name,
              email: user.email,
              password: "", // No password for OAuth users
              image: user.image,
            })
            .returning({
              id: users.id,
            });

          // Link the social account to the new user
          await db.insert(accounts).values({
            userId: newUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at,
            tokenType: account.token_type,
            scope: account.scope,
            idToken: account.id_token,
          });

          return true;
        }
      }
      // For credentials login
      else if (account?.provider === "credentials") {
        // NextAuth.js handles session creation automatically for credentials provider
        // We don't need to manually create sessions here
        return true;
      }

      return true;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub || "";
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: { id: string } }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
