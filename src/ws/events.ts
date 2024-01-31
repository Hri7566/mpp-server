import { ServerEventListener, ServerEvents } from "../util/types";

export class EventGroup {
    public eventList = new Array<ServerEventListener<any>>();
    constructor(public id: string) {}

    public add(listener: ServerEventListener<any>) {
        this.eventList.push(listener);
    }

    public addMany(...listeners: ServerEventListener<any>[]) {
        listeners.forEach(l => this.add(l));
    }

    public remove(listener: ServerEventListener<any>) {
        this.eventList.splice(this.eventList.indexOf(listener), 1);
    }
}

export const eventGroups = new Array<EventGroup>();

import "./events.inc";
