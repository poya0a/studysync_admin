"use client";
import styles from "@/styles/components/_dashboard.module.scss";

type Props = {
    period: 7 | 30;
    setPeriod: (p: 7 | 30) => void;
};

export default function PeriodSelector({ period, setPeriod }: Props) {
    return (
        <div className={styles.periodSelector}>
            {[7, 30].map((p) => (
                <button
                    key={p}
                    className={`${styles.periodButton} ${period === p ? styles.active : ""}`}
                    onClick={() => setPeriod(p as 7 | 30)}
                >
                    최근 {p}일
                </button>
            ))}
        </div>
    );
}