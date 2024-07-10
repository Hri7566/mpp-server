import { RateLimit } from "../RateLimit";
import { RateLimitChain } from "../RateLimitChain";
import { RateLimitConstructorList, config } from "../config";

export const adminLimits: RateLimitConstructorList = {
    normal: {
        a: () => new RateLimit(config.admin.normal.a),
        m: () => new RateLimit(config.admin.normal.m),
        ch: () => new RateLimit(config.admin.normal.ch),
        kickban: () => new RateLimit(config.crown.normal.kickban),
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
                config.admin.chains.userset.interval,
                config.admin.chains.userset.num
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
