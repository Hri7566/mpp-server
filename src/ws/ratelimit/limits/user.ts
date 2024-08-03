import { RateLimit } from "../RateLimit";
import { RateLimitChain } from "../RateLimitChain";
import { RateLimitConstructorList, config } from "../config";

export const userLimits: RateLimitConstructorList = {
    normal: {
        a: () => new RateLimit(config.user.normal.a),
        m: () => new RateLimit(config.user.normal.m),
        ch: () => new RateLimit(config.user.normal.ch),
        kickban: () => new RateLimit(config.user.normal.kickban),
        unban: () => new RateLimit(config.user.normal.unban),
        t: () => new RateLimit(config.user.normal.t),
        "+ls": () => new RateLimit(config.user.normal["+ls"]),
        "-ls": () => new RateLimit(config.user.normal["-ls"]),
        chown: () => new RateLimit(config.user.normal.chown),

        hi: () => new RateLimit(config.user.normal.hi),
        bye: () => new RateLimit(config.user.normal.bye),
        devices: () => new RateLimit(config.user.normal.devices),
        "admin message": () => new RateLimit(config.user.normal["admin message"])
    },
    chains: {
        userset: () =>
            new RateLimitChain(
                config.user.chains.userset.num,
                config.user.chains.userset.interval
            ),
        chset: () =>
            new RateLimitChain(
                config.user.chains.chset.num,
                config.user.chains.userset.interval
            ),
        n: () =>
            new RateLimitChain(
                config.user.chains.n.num,
                config.user.chains.userset.interval
            )
    }
};
