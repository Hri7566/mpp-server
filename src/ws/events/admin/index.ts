import { EventGroup, eventGroups } from "../../events";

export const EVENT_GROUP_ADMIN = new EventGroup("admin");

import { color } from "./handlers/color";
import { user_flag } from "./handlers/user_flag";

EVENT_GROUP_ADMIN.add(color);
EVENT_GROUP_ADMIN.add(user_flag);

eventGroups.push(EVENT_GROUP_ADMIN);
