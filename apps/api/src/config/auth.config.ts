import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, users, userRole } from "@repo/db";
import * as schema from "@repo/db";
import { env } from "./env.config";
import logger from "../utils/logger.util"
import { eq } from "drizzle-orm";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { participantsDb } from "../../../../packages/db/sqlite/client";
import { participants } from "../../../../packages/db/sqlite/schema";

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
        schema,
    }),
    logger: {
        log: (level, message, ...args) => {
            const err = args.find((a) => a instanceof Error);
            logger[level](err ? { err } : args.length ? { args } : {}, message);
        },
    },
    onAPIError: {
        throw: false,
        errorURL: `${env.WEB_URL}/auth/error`,
    },
    advanced: {
        database: { generateId: "uuid" },
    },
    user: {
        fields: { image: "avatarUrl" },
        additionalFields: {
            role: {
                type: "string",
                defaultValue: userRole.Student,
                input: false
            },
            githubUsername: {
                type: "string",
                required: false,
                input: false
            },
            githubId: {
                type: "string",
                required: false,
                input: false
            },
        },
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google", "github"],
            allowDifferentEmails: true,
            updateUserInfoOnLink: true,
            requireLocalEmailVerified: false,
        },
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path === "/sign-in/social" && ctx.body?.provider === "github") {
                throw new APIError("FORBIDDEN", {
                    code: "github_direct_signin_not_allowed",
                    message: "GitHub can only be linked to an existing account, not used to sign in directly.",
                });
            }

            if (ctx.path === "/link-social" && ctx.body?.provider === "github") {
                const email = ctx.context.session?.user?.email;

                if (!email) {
                    throw new APIError("UNAUTHORIZED", {
                        code: "no_active_session",
                        message: "You must be signed in with Google before linking GitHub.",
                    });
                }

                const match = await participantsDb
                    .select()
                    .from(participants)
                    .where(eq(participants.email, email.toLowerCase()))
                    .get();

                if (!match) {
                    throw new APIError("FORBIDDEN", {
                        code: "not_a_participant",
                        message: "This email is not registered as a participant.",
                    });
                }
            }
        }),
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const participant = await participantsDb
                        .select({ email: participants.email })
                        .from(participants)
                        .where(eq(participants.email, user.email.toLowerCase()))
                        .get();

                    if (!participant) {
                        throw new APIError("BAD_REQUEST", {
                            code: "signup_disabled",
                            message: "Signup is disabled for this email address.",
                        });
                    }
                },
            },
        },
account: {
create: {
after: async (account) => {
if (account.providerId !== "github") return;
const res = await fetch("https://api.github.com/user", {
headers: { Authorization: `Bearer ${account.accessToken}` },
                });
if (!res.ok) {
                    logger.error({ status: res.status }, "Failed to fetch GitHub profile for account linking");
return;
                }
const profile = (await res.json()) as { id?: string | number; login?: string };
await db.update(users).set({
githubId: String(profile.id ?? ""),
githubUsername: profile.login ?? "",
                }).where(eq(users.id, account.userId));
            },
        },
    },
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
        },

        github: {
            clientId: env.GITHUB_CLIENT_ID as string,
            clientSecret: env.GITHUB_CLIENT_SECRET as string,
            scope: ["read:user", "user:email"],
            disableSignUp: true,
        },
    },
    emailAndPassword: { enabled: false },

    trustedOrigins: [
        env.WEB_URL as string,
    ],
})