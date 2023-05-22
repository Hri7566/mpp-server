const Crown = require("../src/channel/Crown");

describe("Crown", () => {
    it("has a starting position of 50, 50", () => {
        const crown = new Crown();

        expect(crown.startPos.x).toBe(50);
        expect(crown.startPos.y).toBe(50);
    });

    it("has a starting timestamp of Date.now()", () => {
        const crown = new Crown();
        expect(crown.time).toBeLessThanOrEqual(Date.now());
    });

    it("has a random end position", () => {
        const crown = new Crown();

        expect(crown.endPos.x).toBeLessThanOrEqual(100);
        expect(crown.endPos.x).toBeGreaterThanOrEqual(0);

        expect(crown.endPos.y).toBeLessThanOrEqual(100);
        expect(crown.endPos.y).toBeGreaterThanOrEqual(0);
    });
});
