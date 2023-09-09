import { EventGroup, eventGroups } from "../../events";

export const EVENTGROUP_USER = new EventGroup("user");

import { hi } from "./handlers/hi";
import { devices } from "./handlers/devices";

EVENTGROUP_USER.add(hi);
EVENTGROUP_USER.add(devices);

eventGroups.push(EVENTGROUP_USER);
