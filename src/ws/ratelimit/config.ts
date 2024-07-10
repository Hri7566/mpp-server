import { loadConfig } from "../../util/config";
import { RateLimit } from "./RateLimit";
import { RateLimitChain } from "./RateLimitChain";

export interface RateLimitConfigList<
    RL = number,
    RLC = { num: number; interval: number }
> {
    normal: {
        a: RL;
        m: RL;
        ch: RL;
        kickban: RL;
        t: RL;
        "+ls": RL;
        "-ls": RL;
        chown: RL;

        // weird limits
        hi: RL;
        bye: RL;
        devices: RL;
        "admin message": RL;
    };

    chains: {
        userset: RLC;
        chset: RLC;
        n: RLC; // not to be confused with NoteQuota
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
            ch: 1000 / 1,
            kickban: 1000 / 8,
            t: 1000 / 128,
            "+ls": 1000 / 60,
            "-ls": 1000 / 60,
            chown: 2000,

            hi: 1000 / 20,
            bye: 1000 / 20,
            devices: 1000 / 20,
            "admin message": 1000 / 20
        },
        chains: {
            userset: {
                interval: 1000 * 60 * 30,
                num: 1000
            },
            chset: {
                interval: 1000 * 60 * 30,
                num: 1024
            },
            n: {
                interval: 1000,
                num: 512
            }
        }
    },
    crown: {
        normal: {
            a: 6000 / 10,
            m: 1000 / 20,
            ch: 1000 / 1,
            kickban: 1000 / 8,
            t: 1000 / 128,
            "+ls": 1000 / 60,
            "-ls": 1000 / 60,
            chown: 2000,

            hi: 1000 / 20,
            bye: 1000 / 20,
            devices: 1000 / 20,
            "admin message": 1000 / 20
        },
        chains: {
            userset: {
                interval: 1000 * 60 * 30,
                num: 1000
            },
            chset: {
                interval: 1000 * 60 * 30,
                num: 1024
            },
            n: {
                interval: 1000,
                num: 512
            }
        }
    },
    admin: {
        normal: {
            a: 6000 / 50,
            m: 1000 / 60,
            ch: 1000 / 10,
            kickban: 1000 / 60,
            t: 1000 / 256,
            "+ls": 1000 / 60,
            "-ls": 1000 / 60,
            chown: 500,

            hi: 1000 / 20,
            bye: 1000 / 20,
            devices: 1000 / 20,
            "admin message": 1000 / 60
        },
        chains: {
            userset: {
                interval: 500,
                num: 1000
            },
            chset: {
                interval: 1000 * 60 * 30,
                num: 1024
            },
            n: {
                interval: 50,
                num: 512
            }
        }
    }
});
