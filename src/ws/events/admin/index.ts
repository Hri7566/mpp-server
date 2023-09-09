import { EventGroup, eventGroups } from "../../events";

export const EVENT_GROUP_ADMIN = new EventGroup("user");

import { color } from "./handlers/color";

EVENT_GROUP_ADMIN.add(color);

eventGroups.push(EVENT_GROUP_ADMIN);
