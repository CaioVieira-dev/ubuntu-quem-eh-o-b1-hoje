import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { db } from "~/server/db";
import {
  accounts,
  invites,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider,
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    signIn: async ({ user }) => {
      const existingUser = await db.query.users.findFirst({
        where({ email }, { eq }) {
          return eq(email, user.email ?? "");
        },
      });

      if (!existingUser) {
        const invite = await db.query.invites.findFirst({
          where({ email, used }, { and, eq }) {
            return and(eq(used, false), eq(email, user.email ?? ""));
          },
        });

        if (!invite) {
          console.error(
            "[ signIn error ] Usuario não convidado: ",
            user?.email,
          );
          return "/?error=SemConvite";
        }

        await db
          .update(invites)
          .set({ used: true })
          .where(eq(invites.id, invite.id));
      }

      return true;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
    async redirect({ baseUrl, url }) {
      //if we get an callbackUrl we use it
      if (url) {
        return url;
      }

      //else, we go to the base url
      return baseUrl;
    },
  },
} satisfies NextAuthConfig;
