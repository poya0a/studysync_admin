"use client";
import styles from "@/styles/components/_dashboard.module.scss";

type Stat = {
    label: string;
    value: number;
};

export default function StatsCards({ stats }: { stats: Stat[] }) {
    return (
        <div className={styles.statsCards}>
            {stats.map((s) => (
                <div
                    className={styles.card}
                    key={s.label}
                >
                    <p>{s.label}</p>
                    <strong>{s.value}</strong>
                </div>
            ))}
        </div>
    );
}