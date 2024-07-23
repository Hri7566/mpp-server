import { RateLimit } from "../RateLimit";
import { RateLimitChain } from "../RateLimitChain";
import { RateLimitConstructorList, config } from "../config";

export const crownLimits: RateLimitConstructorList = {
    normal: {
        a: () => new RateLimit(config.crown.normal.a),
        m: () => new RateLimit(config.crown.normal.m),
        ch: () => new RateLimit(config.crown.normal.ch),
        kickban: () => new RateLimit(config.crown.normal.kickban),
        unban: () => new RateLimit(config.crown.normal.unban),
        t: () => new RateLimit(config.crown.normal.t),
        "+ls": () => new RateLimit(config.crown.normal["+ls"]),
        "-ls": () => new RateLimit(config.crown.normal["-ls"]),
        chown: () => new RateLimit(config.crown.normal.chown),

        hi: () => new RateLimit(config.crown.normal.hi),
        bye: () => new RateLimit(config.crown.normal.bye),
        devices: () => new RateLimit(config.crown.normal.devices),
        "admin message": () => new RateLimit(config.crown.normal["admin message"])
    },
    chains: {
        userset: () =>
            new RateLimitChain(
                config.crown.chains.userset.interval,
                config.crown.chains.userset.num
            ),
        chset: () =>
            new RateLimitChain(
                config.crown.chains.chset.interval,
                config.crown.chains.userset.num
            ),
        n: () =>
            new RateLimitChain(
                config.crown.chains.n.interval,
                config.crown.chains.userset.num
            )
    }
};
