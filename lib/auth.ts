import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcrypt";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "./schema";
import { getServerSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      emailVerified?: Date | null;
    };
  }

  interface User {
    emailVerified?: Date | null;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-email",
  },
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

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (user.authProvider === "google") {
          throw new Error(
            "This email is registered with Google. Please sign in with Google."
          );
        }

        if (!user.password) {
          throw new Error("Invalid login method");
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
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, user.email!),
          });

          if (!existingUser) {
            const [newUser] = await db
              .insert(users)
              .values({
                name: user.name,
                email: user.email!,
                image: user.image,
                emailVerified: new Date(),
                authProvider: "google",
              })
              .returning();

            user.id = String(newUser.id);
          } else {
            user.id = String(existingUser.id);
          }
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | null;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.emailVerified = user.emailVerified;
      }

      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.picture = session.user.image;
        token.emailVerified = session.user.emailVerified;
      }

      return token;
    },
  },
};

export async function getSession() {
  return await getServerSession(authOptions);
}
