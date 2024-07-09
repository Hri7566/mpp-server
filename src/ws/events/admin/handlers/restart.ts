import { readUser, updateUser } from "../../../../data/user";
import { ServerEventListener } from "../../../../util/types";
import { findSocketsByUserID, socketsBySocketID } from "../../../Socket";

let timeout: Timer;

export const restart: ServerEventListener<"restart"> = {
    id: "restart",
    callback: async (msg, socket) => {
        // Restart server
        if (typeof timeout !== "undefined") {
            return;
        }

        // Let everyone know
        for (const sock of socketsBySocketID.values()) {
            sock.sendNotification({
                id: "server-restart",
                target: "#piano",
                duration: 20000,
                class: "classic",
                title: "Server Restart",
                text: "The server is restarting soon."
            });
        }

        setTimeout(() => {
            // Stop the program
            process.exit();
        }, 20000);
    }
};
