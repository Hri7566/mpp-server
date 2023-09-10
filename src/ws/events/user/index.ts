import { EventGroup, eventGroups } from "../../events";

export const EVENTGROUP_USER = new EventGroup("user");

import { hi } from "./handlers/hi";
import { devices } from "./handlers/devices";
import { ch } from "./handlers/ch";
import { m } from "./handlers/m";

EVENTGROUP_USER.add(hi);
EVENTGROUP_USER.add(devices);
EVENTGROUP_USER.add(ch);
EVENTGROUP_USER.add(m);

eventGroups.push(EVENTGROUP_USER);
