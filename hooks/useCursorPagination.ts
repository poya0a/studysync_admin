import { useState } from "react";

export function useCursorPagination() {
    const [page, setPage] = useState(1);
    const [cursors, setCursors] = useState<Record<number, string | null>>({
        1: null,
    });

    const movePage = (nextPage: number, nextCursor?: string | null) => {
        if (nextPage < 1) return;

        if (nextPage > page && nextCursor) {
            setCursors(prev => ({
                ...prev,
                [nextPage]: nextCursor,
            }));
        }

        setPage(nextPage);
    };

    const getCursor = () => cursors[page] ?? null;

    return {
        page,
        movePage,
        getCursor,
    };
}