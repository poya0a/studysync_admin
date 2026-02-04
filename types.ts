export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";
export type GroupType = "personal" | "group";

export type UserData = {
    uid: string | null;
    name: string | null;
    email: string | null;
    role: UserRole;
    createdAt: number;
    lastLogin: number;
};

export type EventBase = {
    uid: string;
    groupId: string | "PERSONAL";
    title: string;
    date: string;
    color: string;
};

export type Event = EventBase & {
    id: string;
    authorName?: string;
};

export type Group = {
    id: string;
    ownerId: string;
    name: string;
    type: GroupType;
    inviteCode?: string;
};

export const PERSONAL_GROUP: Group = {
    id: "PERSONAL",
    ownerId: "",
    name: "개인 일정",
    type: "personal",
};