import { RateLimit } from "../RateLimit";
import { RateLimitChain } from "../RateLimitChain";
import { RateLimitConstructorList, config } from "../config";

export const adminLimits: RateLimitConstructorList = {
    normal: {
        a: () => new RateLimit(config.admin.normal.a),
        m: () => new RateLimit(config.admin.normal.m)
    },
    chains: {
        userset: () =>
            new RateLimitChain(
                config.admin.chains.userset.interval,
                config.admin.chains.userset.num
            )
    }
};
