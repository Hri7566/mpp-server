import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        PORT: z.coerce.number(),
        HOST: z.union([z.string().url(), z.string().ip()]).optional(),
        SALT: z.string().min(10),
        ADMIN_PASS: z.string()
    },
    isServer: true,
    runtimeEnv: process.env
});

export default env;
