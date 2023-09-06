import { app } from "http/fastify";
import env from "util/env";

app.listen({
    port: env.PORT
});
