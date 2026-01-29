import type { ColumnDef } from "@tanstack/react-table";
import type { Event } from "@/types";

export const eventColumns: ColumnDef<Event>[] = [
    {
        header: "색상",
        accessorKey: "color",
        cell: ({ getValue }) => (
            <div
                style={{
                    backgroundColor: getValue() as string,
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    margin: "auto",
                }}
            />
        ),
    },
    {
        header: "ID",
        accessorKey: "id",
    },
    {
        header: "제목",
        accessorKey: "title",
    },
    {
        header: "날짜",
        accessorKey: "date",
    },
    {
        header: "생성일",
        accessorKey: "createdAt",
        cell: ({ getValue }) => {
            const ts = getValue() as number;
            const d = new Date(ts);

            return `${d.getFullYear()}-${String(
                d.getMonth() + 1
            ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        },
    },
    {
        header: "타입",
        accessorKey: "groupId",
        cell: ({ getValue }) => (getValue() ? "그룹" : "개인"),
    },
];