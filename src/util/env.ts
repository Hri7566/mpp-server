import dotenv from "dotenv";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

dotenv.config();

export const env = createEnv({
    server: {
        PORT: z.coerce.number(),
        SALT: z.string().min(10),
        ADMIN_PASS: z.string()
    },
    isServer: true,
    clientPrefix: "",
    client: {},
    runtimeEnv: process.env
});

export default env;
