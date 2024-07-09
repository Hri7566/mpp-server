import { EventGroup, eventGroups } from "../../events";
import { clear_chat } from "./handlers/clear_chat";

export const EVENT_GROUP_ADMIN = new EventGroup("admin");

import { color } from "./handlers/color";
import { name } from "./handlers/name";
import { notification } from "./handlers/notification";
import { restart } from "./handlers/restart";
import { user_flag } from "./handlers/user_flag";

// EVENT_GROUP_ADMIN.add(color);
// EVENT_GROUP_ADMIN.add(name);
// EVENT_GROUP_ADMIN.add(user_flag);

EVENT_GROUP_ADMIN.addMany(color, name, user_flag, clear_chat, notification, restart);

eventGroups.push(EVENT_GROUP_ADMIN);
