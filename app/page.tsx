"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "@/styles/pages/_admin.module.scss";

export default function AdminPage() {

    return (
        <>
            <Header />
                <div className={styles.container}>
                </div>
            <Footer />
        </>
    );
}