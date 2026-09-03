import {betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {db} from "@repo/db";
import * as schema from "@repo/db";
import {env} from "./env.config";
import logger from "../utils/logger.util"

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
        schema,
    }),
    logger: {
        log : (level, message, ...args) => {
            logger[level](args.length ? {args}:{},message);
        },
    },

    advanced:{
        database: {generateId: "uuid"},
    },
    user:{
        fields: { image: "avatar_url"},
        additionalFields:{
            role: {type:"string", 
                defaultValue:"student", 
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
            mapProfileToUser:(p)=>({
                githubUsername: p.login,
                githubId: String(p.id),
            })
        },
    },
    
    emailAndPassword: { enabled: false },

    trustedOrigins: [
        env.WEB_URL as string,
    ],
})