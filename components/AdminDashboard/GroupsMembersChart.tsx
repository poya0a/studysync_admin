"use client";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import styles from "@/styles/components/_dashboard.module.scss";

type GroupItem = {
    name: string;
    members: number;
};

type Props = {
    data: GroupItem[];
};

export default function GroupsMembersChart({ data }: Props) {
    return (
        <section className={styles.groupsMembersChart}>
            <ResponsiveContainer>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickMargin={15} tickLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="members" radius={[5, 5, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </section>
    );
}
