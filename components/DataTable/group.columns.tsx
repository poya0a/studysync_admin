import type { ColumnDef } from "@tanstack/react-table";
import type { Group } from "@/types";

export const groupColumns: ColumnDef<Group>[] = [
    {
        header: "ID",
        accessorKey: "id",
    },
    {
        header: "그룹 이름",
        accessorKey: "name",
    },
    {
        header: "초대 코드",
        accessorKey: "inviteCode",
    },
    {
        header: "멤버 수",
        accessorKey: "members",
        cell: ({ getValue }) => {
            const members = getValue() as string[] | undefined;
            return members?.length ?? 0;
        },
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
];