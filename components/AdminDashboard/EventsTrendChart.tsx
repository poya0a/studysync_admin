"use client";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import styles from "@/styles/components/_dashboard.module.scss";

type TrendData = {
    date: string;
    count: number;
};

type Props = {
    data: TrendData[];
    onSelectDate: (date: string) => void;
};

export default function EventsTrendChart({ data }: Props) {
    return (
        <section className={styles.eventsTrendChart}>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="count"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </section>
    );
}
