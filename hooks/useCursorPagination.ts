import { useState } from "react";

export function useCursorPagination() {
    const [page, setPage] = useState(1);
    const [cursor, setCursor] = useState<string | null>(null);

    const movePage = (newPage: number, nextCursor: string | null) => {
        setPage(newPage);
        setCursor(nextCursor);
    };

    const getCursor = () => cursor;

    const reset = () => {
        setPage(1);
        setCursor(null);
    };

    return {
        page,
        cursor,
        movePage,
        getCursor,
        reset,
    };
}