import { EventGroup, eventGroups } from "../../events";

export const EVENTGROUP_USER = new EventGroup("user");

import { hi } from "./handlers/hi";
import { devices } from "./handlers/devices";
import { ch } from "./handlers/ch";
import { m } from "./handlers/m";
import { a } from "./handlers/a";
import { userset } from "./handlers/userset";
import { n } from "./handlers/n";
import { plus_ls } from "./handlers/+ls";
import { minus_ls } from "./handlers/-ls";
import { admin_message } from "./handlers/admin_message";
import { chset } from "./handlers/chset";
import { kickban } from "./handlers/kickban";
import { bye } from "./handlers/bye";
import { chown } from "./handlers/chown";

// Imagine not having an "addMany" function...

// EVENTGROUP_USER.add(hi);
// EVENTGROUP_USER.add(devices);
// EVENTGROUP_USER.add(ch);
// EVENTGROUP_USER.add(m);
// EVENTGROUP_USER.add(a);
// EVENTGROUP_USER.add(userset);
// EVENTGROUP_USER.add(n);
// EVENTGROUP_USER.add(plus_ls);
// EVENTGROUP_USER.add(minus_ls);
// EVENTGROUP_USER.add(admin_message);
// EVENTGROUP_USER.add(chset);

// Imagine it looks exactly the same and calls the same function underneath
EVENTGROUP_USER.addMany(
    hi,
    devices,
    ch,
    m,
    a,
    userset,
    n,
    plus_ls,
    minus_ls,
    admin_message,
    chset,
    kickban,
    bye,
    chown
);

eventGroups.push(EVENTGROUP_USER);
