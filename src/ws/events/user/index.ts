import { EventGroup, eventGroups } from "../../events";

export const EVENTGROUP_USER = new EventGroup("user");

import { hi } from "./handlers/hi";

EVENTGROUP_USER.add(hi);

eventGroups.push(EVENTGROUP_USER);
