import { test, expect } from "bun:test";
import { Channel } from "../../src/channel/Channel";

test("Channel is created correctly", () => {
    const channel = new Channel("my room");
    expect(channel.getID()).toBe("my room");

    const info = channel.getInfo();
    expect(info.id).toBe("my room");
    expect(info._id).toBe("my room");
    expect(info.count).toBe(0);

    const ppl = channel.getParticipantList();
    expect(ppl).toBeEmpty();
});
