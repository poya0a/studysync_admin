import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    deleteDoc,
} from "firebase/firestore";
import type { Event, Group } from "@/types";

export async function fetchEvents(
    page = 1,
    size = 10,
    keyword?: string
): Promise<{ data: Event[]; total: number }> {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("date", "asc"));

    const snapshot = await getDocs(q);
    let data: Event[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Event));

    if (keyword) {
        const lowerKeyword = keyword.toLowerCase();
        data = data.filter((e) => e.title.toLowerCase().includes(lowerKeyword));
    }

    const total = data.length;
    const start = (page - 1) * size;
    const end = start + size;

    return { data: data.slice(start, end), total };
}

export async function fetchGroups(): Promise<Group[]> {
    const snapshot = await getDocs(collection(db, "groups"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Group));
}

export async function deleteEvent(eventId: string): Promise<void> {
    await deleteDoc(doc(db, "events", eventId));
}