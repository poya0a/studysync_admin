"use client";
import { useState } from "react";
import StatsCards from "./StatsCards";
import EventsTrendChart from "./EventsTrendChart";
import GroupsMembersChart from "./GroupsMembersChart";
import PeriodSelector from "./PeriodSelector";
import { useAdminStatsQuery } from "@/hooks/useAdminStatsQuery";
import { useEventsTrendQuery } from "@/hooks/useEventsTrendQuery";
import { useGroupsMembersQuery } from "@/hooks/useGroupsMembersQuery";
import styles from "@/styles/components/_dashboard.module.scss";

type Period = 7 | 30;

export default function Dashboard({ role }: { role: string }) {
    const [period, setPeriod] = useState<Period>(7);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const { data: stats } = useAdminStatsQuery();
    const { data: eventsTrend } = useEventsTrendQuery(period);
    const { data: groupsMembers } = useGroupsMembersQuery();

    return (
        <div className={styles.container}>
            <div className={styles.dashboardHeader}>
                <h2>대시 보드</h2>
                <PeriodSelector period={period} setPeriod={setPeriod} />
            </div>
            <div className={styles.dashboard}>

                {stats && (
                    <StatsCards
                        stats={[
                            { label: "전체 사용자", value: stats.users },
                            { label: "전체 그룹", value: stats.groups },
                            { label: "전체 일정", value: stats.events },
                        ]}
                    />
                )}

                {role === "SUPER_ADMIN" && groupsMembers && (
                    <>
                        <h3>그룹 인원 분포</h3>
                        <GroupsMembersChart data={groupsMembers} />
                    </>
                )}

                {eventsTrend && (
                    <>
                        <h3>일정 생성 추이</h3>
                        <EventsTrendChart
                            data={eventsTrend}
                            onSelectDate={(date) => setSelectedDate(date)}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
