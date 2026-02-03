"use client";
import { useMemo } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    ColumnDef,
} from "@tanstack/react-table";
import { adminSelectListData } from "@/app/page";
import styles from "@/styles/components/_dataTable.module.scss";

interface Props<T> {
    name: string;
    data: T[];
    columns: ColumnDef<T>[];
    page: number;
    setPage: (page: number) => void;
    hasNextPage: boolean;
    onRowClick: (type: string, row: T) => void;
}

export default function DataTable<T>({ name, data, columns, page, setPage, hasNextPage, onRowClick }: Props<T>) {
    const maxPage = hasNextPage ? page + 1 : page;
    const memoColumns = useMemo(() => columns, [columns]);

    const table = useReactTable({
        data,
        columns: memoColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <div className={styles.dataTableHeader}>
                <h2>{name} 관리</h2>
                <p>총 {name}: {data?.length ?? 0}</p>
            </div>
            <div className={styles.container}>
                <div className={styles.tableWrapper}>
                    { data.length > 0 ? 
                        <table className={styles.dataTable}>
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                    ))}
                                </tr>
                                ))}
                            </thead>

                            <tbody>
                                {table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    onClick={() => {
                                        const type = adminSelectListData.find((item) => item.name === name)!.id;
                                        onRowClick(type, row.original)
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                    ))}
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        :
                        <p>데이터가 없습니다.</p>
                    }
                </div>
            </div>
            <div className={styles.pagination}>
                {page > 1 &&
                    <button
                        disabled={page === 1}
                        className={styles.prevButton}
                        onClick={() => setPage(page - 1)}
                    ></button>
                }

                {Array.from({ length: maxPage }).map((_, i) => {
                    const p = i + 1;
                    const visible =
                    p === 1 ||
                    Math.abs(p - page) <= 1;

                    if (!visible) return null;

                    return (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`${styles.pageButton} ${p === page ? styles.active : ""}`}
                        >
                            {p}
                        </button>
                    );
                })}

                {page > 1 &&
                <button
                    disabled={!hasNextPage}
                    className={styles.nextButton}
                    onClick={() => setPage(page + 1)}
                ></button>
                }
            </div>
        </>
    );
}