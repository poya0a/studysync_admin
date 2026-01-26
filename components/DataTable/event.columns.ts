
import type { ColumnDef } from "@tanstack/react-table";
import type { Event } from "@/types";

export const eventColumns: ColumnDef<Event>[] = [
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
        header: "색상",
        accessorKey: "color",
        cell: ({ getValue }) => `<div style={{ backgroundColor: ${getValue() as string}, width: 20, height: 20 }}></div>`,
    },
    {
        header: "UID",
        accessorKey: "uid",
    },
    {
        header: "그룹 ID",
        accessorKey: "groupId",
        cell: ({ getValue }) => getValue() ?? "개인",
    },
];