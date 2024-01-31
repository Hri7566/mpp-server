import { RateLimit } from "../RateLimit";
import { RateLimitChain } from "../RateLimitChain";
import { RateLimitConstructorList, config } from "../config";

export const crownLimits: RateLimitConstructorList = {
    normal: {
        a: () => new RateLimit(config.crown.normal.a),
        m: () => new RateLimit(config.crown.normal.m),
        ch: () => new RateLimit(config.crown.normal.ch)
    },
    chains: {
        userset: () =>
            new RateLimitChain(
                config.crown.chains.userset.interval,
                config.crown.chains.userset.num
            )
    }
};
