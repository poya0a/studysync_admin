"use client";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    ColumnDef,
} from "@tanstack/react-table";

interface Props<T> {
    data: T[];
    columns: ColumnDef<T>[];
}

export default function DataTable<T>({ data, columns }: Props<T>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                    <th
                        key={header.id}
                        style={{ borderBottom: "1px solid #ccc", padding: 8, textAlign: "left" }}
                    >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                    ))}
                </tr>
                ))}
            </thead>

            <tbody>
                {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                    ))}
                </tr>
                ))}
            </tbody>
        </table>
    );
}