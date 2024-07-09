import { RateLimit } from "../RateLimit";
import { RateLimitChain } from "../RateLimitChain";
import { RateLimitConstructorList, config } from "../config";

// All this does is instantiate rate limits from the config
export const userLimits: RateLimitConstructorList = {
    normal: {
        a: () => new RateLimit(config.user.normal.a),
        m: () => new RateLimit(config.user.normal.m),
        ch: () => new RateLimit(config.user.normal.ch),
        kickban: () => new RateLimit(config.user.normal.kickban)
    },
    chains: {
        userset: () =>
            new RateLimitChain(
                config.user.chains.userset.interval,
                config.user.chains.userset.num
            )
    }
};
