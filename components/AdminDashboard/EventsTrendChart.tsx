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
                    <XAxis dataKey="date" tickMargin={15} tickLine={false}/>
                    <YAxis allowDecimals={false} tickLine={false} />
                    <Tooltip cursor={false} />
                    <Line
                        type="monotone"
                        dataKey="count"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: '#00178e',
                            stroke: '#ffffff',
                            strokeWidth: 2
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </section>
    );
}
