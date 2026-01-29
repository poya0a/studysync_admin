import type { ColumnDef } from "@tanstack/react-table";
import type { UserData } from "@/types";

export const userListColumns: ColumnDef<UserData>[] = [
    {
        header: "이름",
        accessorKey: "name",
    },
    {
        header: "이메일",
        accessorKey: "email",
    },
    {
        header: "권한",
        accessorKey: "role",
    },
    {
        header: "최초 로그인",
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
        header: "마지막 로그인",
        accessorKey: "lastLogin",
        cell: ({ getValue }) => {
            const ts = getValue() as number;
            const d = new Date(ts);

            return `${d.getFullYear()}-${String(
                d.getMonth() + 1
            ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        },
    },
];