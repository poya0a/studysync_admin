"use client";
import Link from "next/link";
import Image from "next/image";
import { auth, provider } from "@/lib/firebase/client";
import { signInWithPopup, signOut } from "firebase/auth";
import { useUserQuery } from "@/hooks/useUserQuery";
import styles from "@/styles/components/_header.module.scss";

export default function Header() {
    const { data: userData, isLoading } = useUserQuery();

    const handleLogin = async () => {
        await signInWithPopup(auth, provider);
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.container}>
                    <Link className={styles.logo} href="https://poya.vercel.app">
                        <Image
                            src="/images/logo_blue.png"
                            width={80}
                            height={80}
                            alt="LOGO"
                        />
                    </Link>
                    {!isLoading && !userData ? 
                        <button onClick={handleLogin} className={styles.loginButon}>
                            Google 로그인
                        </button>
                        :
                        <button onClick={handleLogout} className={styles.loginButon}>
                            로그아웃
                        </button>
                    }
                </div>
            </header>
            {isLoading &&
                <div className={styles.overlay}>
                    <div className={styles.spinner}></div>
                </div>
            }
        </>
    );
}