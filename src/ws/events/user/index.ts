import { EventGroup, eventGroups } from "../../events";

export const EVENTGROUP_USER = new EventGroup("user");

import { hi } from "./handlers/hi";
import { devices } from "./handlers/devices";
import { ch } from "./handlers/ch";

EVENTGROUP_USER.add(hi);
EVENTGROUP_USER.add(devices);
EVENTGROUP_USER.add(ch);

eventGroups.push(EVENTGROUP_USER);
