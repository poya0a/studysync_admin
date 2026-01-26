"use client";
import { useState } from "react";
import { useEventsQuery } from "@/hooks/useEventsQuery";
import { useGroupsQuery } from "@/hooks/useGroupsQuery";
import { eventColumns } from "@/components/DataTable/event.columns";
import { groupColumns } from "@/components/DataTable/group.columns";
import DataTable from "@/components/DataTable";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "@/styles/pages/_admin.module.scss";

export default function AdminPage() {
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");

    const { data: eventsData, isLoading: eventsLoading } = useEventsQuery(page, 10, keyword);
    const { data: groupsData, isLoading: groupsLoading } = useGroupsQuery();

    return (
        <>
            <Header />
            <div className={styles.container}>
                <div className={styles.adminHeader}>
                    <h1>Study Sync Admin</h1>
                    <p className={styles.subtitle}>스터디 일정 관리 캘린더 관리자</p>
                </div>

                <h2>일정 관리</h2>
                <input placeholder="검색" value={keyword} onChange={e => setKeyword(e.target.value)} />
                {eventsLoading ? <p>로딩중...</p> : <DataTable data={eventsData?.data ?? []} columns={eventColumns} />}
                
                <h2>그룹 관리</h2>
                {groupsLoading ? <p>로딩중...</p> : <DataTable data={groupsData ?? []} columns={groupColumns} />}
            </div>
            <Footer />
        </>
    );
};