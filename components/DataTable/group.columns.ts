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
        header: "소유자 UID",
        accessorKey: "ownerId",
    },
    {
        header: "멤버 수",
        accessorKey: "members",
        cell: ({ getValue }) => (getValue() as string[]).length,
    },
    {
        header: "생성일",
        accessorKey: "createdAt",
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
];