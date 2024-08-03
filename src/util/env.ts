import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { config } from "../ws/usersConfig";

// Best way to do env ever
export const env = createEnv({
    server: {
        PORT: z.coerce.number(),
        HOST: z.union([z.string().url(), z.string().ip()]).optional(),
        SALT: z.string().min(10),
        ADMIN_PASS: z.string(),
        COLOR_SALT: config.colorGeneration == "mpp" ? z.string().min(10) : z.string().optional(),
    },
    isServer: true,
    // Bun loads process.env automatically so we don't have to use modules
    runtimeEnv: process.env
});

export default env;
