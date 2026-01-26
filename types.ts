export type EventBase = {
    title: string;
    date: string;
    color: string;
};

export type PersonalEventInput = EventBase & {
    uid: string;
    groupId: null;
};

export type GroupEventInput = EventBase & {
    uid: string;
    groupId: string;
};

export type EventInput = PersonalEventInput | GroupEventInput;

export type Event = EventInput & {
    id: string;
};

export interface Group {
    id: string;
    name: string;
    inviteCode: string;
    ownerId: string;
    members: string[];
    createdAt: Date;
}