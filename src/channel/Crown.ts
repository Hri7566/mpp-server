import { Participant } from "../util/types";
import { Socket } from "../ws/Socket";

export class Crown {
    public userId: string | undefined;
    public participantId: string | undefined;
    public time: number = Date.now();

    public canBeSetBy(socket: Socket) {
        // can claim, drop, or give if...
        const flags = socket.getUserFlags();

        if (!flags) return false;
        if (flags.cansetcrowns) return true;

        const channel = socket.getCurrentChannel();
        if (!channel) return false;

        const part = socket.getParticipant();
        if (!part) return false;

        if (!channel.getSetting("lobby")) {
            // if there is no user (never been owned)
            if (!this.userId) return true;

            // if you're the user (you dropped it or left the room, nobody has claimed it)
            if (this.userId === part._id) return true;

            // if there is no participant and 15 seconds have passed
            if (!this.participantId && this.time + 15000 < Date.now())
                return true;

            // you're the specially designated channel owner
            if (channel.getSetting("owner_id") === part._id) return true;
        }

        return false;
    }
}

export default Crown;
