import { RateLimit } from "../RateLimit";
import { RateLimitChain } from "../RateLimitChain";
import { RateLimitConstructorList, config } from "../config";

export const userLimits: RateLimitConstructorList = {
    normal: {
        a: () => new RateLimit(config.user.normal.a),
        m: () => new RateLimit(config.user.normal.m),
        ch: () => new RateLimit(config.user.normal.ch)
    },
    chains: {
        userset: () =>
            new RateLimitChain(
                config.user.chains.userset.interval,
                config.user.chains.userset.num
            )
    }
};
