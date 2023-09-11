import { RateLimit } from "./RateLimit";

export class RateLimitChain {
    public chain: RateLimit[] = [];

    constructor(num: number, interval_ms: number) {
        this.setNumAndInterval(num, interval_ms);
    }

    public attempt(time: number = Date.now()) {
        for (let i = 0; i < this.chain.length; i++) {
            if (this.chain[i].attempt(time)) return true;
        }

        return true;
    }

    public setNumAndInterval(num: number, interval_ms: number) {
        this.chain = [];

        for (let i = 0; i < num; i++) {
            this.chain.push(new RateLimit(interval_ms));
        }
    }
}
