export type CursorPayload = {
    createdAt: number;
    id: string;
};

export function encodeCursor(cursor: CursorPayload) {
    return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeCursor(encoded: string): CursorPayload {
    return JSON.parse(
        Buffer.from(encoded, "base64url").toString("utf-8")
    );
}