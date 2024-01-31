import { loadConfig } from "../../util/config";
import { RateLimit } from "./RateLimit";
import { RateLimitChain } from "./RateLimitChain";

export interface RateLimitConfigList<
    RL = number,
    RLC = { num: number; interval: number }
> {
    normal: {
        m: RL;
        a: RL;
        ch: RL;
    };

    chains: {
        userset: RLC;
    };
}

export type RateLimitConstructorList = RateLimitConfigList<
    () => RateLimit,
    () => RateLimitChain
>;

export type RateLimitList = RateLimitConfigList<RateLimit, RateLimitChain>;

export interface RateLimitsConfig {
    user: RateLimitConfigList;
    crown: RateLimitConfigList;
    admin: RateLimitConfigList;
}

export const config = loadConfig<RateLimitsConfig>("config/ratelimits.yml", {
    user: {
        normal: {
            a: 6000 / 4,
            m: 1000 / 20,
            ch: 1000 / 1
        },
        chains: {
            userset: {
                interval: 1000 * 60 * 30,
                num: 1000
            }
        }
    },
    crown: {
        normal: {
            a: 6000 / 10,
            m: 1000 / 20,
            ch: 1000 / 1
        },
        chains: {
            userset: {
                interval: 1000 * 60 * 30,
                num: 1000
            }
        }
    },
    admin: {
        normal: {
            a: 6000 / 50,
            m: 1000 / 60,
            ch: 1000 / 10
        },
        chains: {
            userset: {
                interval: 1000 * 60 * 30,
                num: 1000
            }
        }
    }
});
