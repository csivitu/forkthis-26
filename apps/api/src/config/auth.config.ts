import {betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {db,users,userRole} from "@repo/db";
import * as schema from "@repo/db";
import {env} from "./env.config";
import logger from "../utils/logger.util"
import { eq } from "drizzle-orm";
import { createAuthMiddleware, APIError } from "better-auth/api";

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
    onAPIError:{
        throw: false,
        errorURL: `${env.WEB_URL}/auth/error`,
    },
    advanced:{
        database: {generateId: "uuid"},
    },
    user:{
        fields: { image: "avatarUrl"},
        additionalFields:{
            role: {type:"string", 
                defaultValue: userRole.Student, 
                input: false
            },
            githubUsername: {
                type: "string",
                required:false,
                input:false
            },
            githubId: {
                type:"string",
                required: false,
                input:false
            },
        },
    },
    account:{
        accountLinking: {
            enabled: true,
            trustedProviders: ["google","github"],
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
    }),
},
    databaseHooks: {
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
                const profile = (await res.json()) as { id: number; login: string };
                await db.update(users).set({
                    githubId: String(profile.id),
                    githubUsername: profile.login,
                }).where(eq(users.id, account.userId));
            },
        },
    },
},
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
            disableSignUp: true,
        },

        github:{
            clientId: env.GITHUB_CLIENT_ID as string,
            clientSecret: env.GITHUB_CLIENT_SECRET as string,
            scope:["read:user", "user:email"],
            disableSignUp:true,
        },
    },
    
    emailAndPassword: { enabled: false },

    trustedOrigins: [
        env.WEB_URL as string,
    ],
})