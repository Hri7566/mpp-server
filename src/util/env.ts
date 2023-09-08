import dotenv from "dotenv";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

dotenv.config({
    path: "./.env"
});

export const env = createEnv({
    server: {
        PORT: z.coerce.number(),
        HOST: z.union([z.string().url(), z.string().ip()]).optional(),
        SALT: z.string().min(10),
        ADMIN_PASS: z.string()
    },
    isServer: true,
    clientPrefix: "",
    client: {},
    runtimeEnv: process.env
});

export default env;
