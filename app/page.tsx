"use client";
import { useState, useRef, useEffect } from "react";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useUserListQuery } from "@/hooks/useUserListQuery";
import { useGroupsQuery } from "@/hooks/useGroupsQuery";
import { useEventsQuery } from "@/hooks/useEventsQuery";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { userListColumns } from "@/components/DataTable/userList.columns";
import { groupColumns } from "@/components/DataTable/group.columns";
import { eventColumns } from "@/components/DataTable/event.columns";
import DataTable from "@/components/DataTable";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "@/styles/pages/_admin.module.scss";

const selectList = [
    "사용자",
    "그룹",
    "일정"
];

type ConfirmAlertState = {
    open: boolean;
    message: string;
    onConfirm?: () => void;
};

export default function AdminPage() {
    const [selectSearch, setSelectSearch] = useState<string>(selectList[0]);
    const [keyword, setKeyword] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);

    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showAlert, setShowAlert] = useState<string>("");
    const [confirmAlert, setConfirmAlert] = useState<ConfirmAlertState>({
        open: false,
        message: "",
    });

    const { data: userData } = useUserQuery();

    const userListPagination = useCursorPagination();
    const groupsPagination = useCursorPagination();
    const eventsPagination = useCursorPagination();

    const { data: userListData } = useUserListQuery(userListPagination.getCursor());

    const { data: groupsData } = useGroupsQuery(groupsPagination.getCursor());

    const { data: eventsData } = useEventsQuery(eventsPagination.getCursor());

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (showAlert && showAlert !== "") {
            const timer = setTimeout(() => setShowAlert(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    const closeConfirmAlert = () => {
        setConfirmAlert(prev => ({
            ...prev,
            open: false,
        }));
    };

    return (
        <>
            <Header />
            <div className={styles.container}>
                <div className={styles.adminHeader}>
                    <h1>Study Sync Admin</h1>
                    <p className={styles.subtitle}>스터디 일정 관리 캘린더 관리자</p>
                </div>
                
                <div className={styles.selectContainer}>
                    <div className={styles.select} ref={ref}>
                        <button
                            type="button"
                            className={styles.trigger}
                            onClick={() => setOpen((v) => !v)}
                        >
                            {selectSearch}
                            <span className={styles.arrow}></span>
                        </button>

                        {open && (
                            <ul className={styles.dropdown}>
                                {selectList.map((item, i) => (
                                    <li
                                        key={`search-select-${i}`}
                                        className={selectSearch === item ? styles.active : ""}
                                        onClick={() => {
                                            setSelectSearch(item);
                                            setOpen(false);
                                        }}
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <input className={styles.searchInput} placeholder="검색" value={keyword} onChange={e => setKeyword(e.target.value)} />
                </div>

                {(userData?.role === "SUPER_ADMIN" || userData?.role === "ADMIN") && userListData?.data &&
                    <DataTable
                        name="사용자"
                        data={userListData.data}
                        columns={userListColumns}
                        page={userListPagination.page}
                        setPage={(p) =>
                            userListPagination.movePage(p, userListData.nextCursor)
                        }
                        hasNextPage={userListData.hasNextPage}
                    />
                }
                {groupsData?.data && 
                    <DataTable 
                        name="그룹"
                        data={groupsData.data} 
                        columns={groupColumns}
                        page={groupsPagination.page}
                        setPage={(p) =>
                            groupsPagination.movePage(p, groupsData.nextCursor)
                        }
                        hasNextPage={groupsData.hasNextPage}
                    />
                }
                {eventsData?.data && 
                    <DataTable 
                        name="일정"
                        data={eventsData.data} 
                        columns={eventColumns}
                        page={eventsPagination.page}
                        setPage={(p) =>
                            eventsPagination.movePage(p, eventsData.nextCursor)
                        }
                        hasNextPage={eventsData.hasNextPage}
                    />
                }
            </div>
            <Footer />
            {confirmAlert.open &&
                <div className={styles.alertOverlay}>
                    <div className={styles.alert}>
                        <div className={styles.alertHeader}>안내</div>
                        <p>{confirmAlert.message}</p>
                        <div className={styles.buttonContainer}>
                            <button className={styles.cancelButton} onClick={closeConfirmAlert}>취소</button>
                            <button className={styles.approveButton} onClick={confirmAlert.onConfirm}>확인</button>
                        </div>
                    </div>
                </div>
            }
            {showAlert && showAlert !== "" &&
                <div className={styles.alert}>
                    <p>{showAlert}</p>
                </div>
            }
        </>
    );
};