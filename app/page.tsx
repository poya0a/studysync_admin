"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useUserListQuery } from "@/hooks/useUserListQuery";
import { useGroupsQuery } from "@/hooks/useGroupsQuery";
import { useEventsQuery } from "@/hooks/useEventsQuery";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { userListColumns } from "@/components/DataTable/userList.columns";
import { groupColumns } from "@/components/DataTable/group.columns";
import { eventColumns } from "@/components/DataTable/event.columns";
import DataTable from "@/components/DataTable";
import Dashboard from "@/components/AdminDashboard/Dashboard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { UserData, Event, Group } from "@/types";
import styles from "@/styles/pages/_admin.module.scss";

export const adminSelectListData = [
    { id: "users", name: "사용자" },
    { id: "groups", name: "그룹" },
    { id: "events", name: "일정" },
];

const userSelectListData = [
    { id: "groups", name: "그룹" },
    { id: "events", name: "일정" },
];

type SelectType = {
    id: string;
    name: string;
};

export const FIELD_CONFIG = {
    email: {
        label: "이메일",
        type: "email",
        editable: false,
    },
    name: {
        label: "이름",
        type: "text",
        editable: true,
    },
    title: {
        label: "제목",
        type: "text",
        editable: true,
    },
    date: {
        label: "날짜",
        type: "text",
        editable: true,
    },
    members: {
        label: "멤버",
        type: "select",
        editable: true,
        options: ["USER", "ADMIN", "SUPER_ADMIN"]
    },
    inviteCode: {
        label: "초대 코드",
        type: "text",
        editable: false,
    },
    color: {
        label: "색상",
        type: "text",
        editable: true,
    },
    role: {
        label: "권한",
        type: "select",
        editable: true,
        options: ["USER", "ADMIN", "SUPER_ADMIN"]
    },
};

type FieldConfigMap = typeof FIELD_CONFIG;
type FieldKey = keyof FieldConfigMap;

type ConfirmAlertState = {
    open: boolean;
    message: string;
    onConfirm?: () => void;
};

type UpdatePopupState = {
    open: boolean;
    type: string;
    selectedRow: UserData | Event | Group | null;
    onConfirm?: () => void;
};

type EditableValue = string | number | null;

export default function AdminPage() {
    const { data: userData } = useUserQuery();

    const [userListKeyword, setUserListKeyword] = useState<string | null>(null);
    const [groupsKeyword, setGroupsKeyword] = useState<string | null>(null);
    const [eventsKeyword, setEventsKeyword] = useState<string | null>(null);

    const userListPagination = useCursorPagination();
    const groupsPagination = useCursorPagination();
    const eventsPagination = useCursorPagination();

    const { data: userListData, refetch: refetchUserList } = useUserListQuery(userListPagination.getCursor(), userListKeyword);

    const { data: groupsData, refetch: refetchGroups } = useGroupsQuery(groupsPagination.getCursor(), groupsKeyword);

    const { data: eventsData, refetch: refetchEvents } = useEventsQuery(eventsPagination.getCursor(), eventsKeyword);

    const [selectList, setSelectList] = useState<SelectType[]>([{ id: "", name: "" }]);
    const [selectSearch, setSelectSearch] = useState<SelectType>({ id: "", name: "" });
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [keyword, setKeyword] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);

    // const [errorMessage, setErrorMessage] = useState<string>("");
    const [showAlert, setShowAlert] = useState<string>("");
    const [confirmAlert, setConfirmAlert] = useState<ConfirmAlertState>({
        open: false,
        message: "",
    });

    const [formData, setFormData] = useState<Record<string, EditableValue>>({});
    const [originalData, setOriginalData] = useState<Record<string, EditableValue>>({});
    const [updatePopup, setUpdatePopup] = useState<UpdatePopupState>({
        open: false,
        type: "",
        selectedRow: null
    });

    useEffect(() => {
        const isOpen = showAlert !== "" || confirmAlert.open || updatePopup.open;
        document.body.style.overflow = isOpen ? "hidden" : "auto";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showAlert, confirmAlert.open, updatePopup.open]);

    useEffect(() => {
        if (!userData) {
            userListPagination.reset();
            groupsPagination.reset();
            eventsPagination.reset();

            refetchUserList();
            refetchGroups();
            refetchEvents();
        } else {
            if (userData.role === "USER") {
                Promise.resolve().then(() => setSelectList(userSelectListData));
            } else {
                Promise.resolve().then(() => setSelectList(adminSelectListData));
            }
        }
    }, [userData]);

    useEffect(() => {
        if (selectList.length > 0) {
            Promise.resolve().then(() => setSelectSearch(selectList[0]));
        }
    }, [selectList]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            userListPagination.reset();
            groupsPagination.reset();
            eventsPagination.reset();

            if (keyword === "") {
                setIsSearching(false);
            } else {
                setIsSearching(true);
            }

            switch (selectSearch.id) {
                case "users":
                    setUserListKeyword(keyword);
                    setGroupsKeyword(null);
                    setEventsKeyword(null);
                    break;
                case "groups":
                    setGroupsKeyword(keyword);
                    setUserListKeyword(null);
                    setEventsKeyword(null);
                    break;
                case "events":
                    setEventsKeyword(keyword);
                    setUserListKeyword(null);
                    setGroupsKeyword(null);
                    break;
            }
        }
    };

    const toEditFormData = <T extends object>(data: T): Record<string, EditableValue> => {
        return Object.entries(data).reduce<Record<string, EditableValue>>((acc, [key, value]) => {
            if (
                typeof value === "string" ||
                typeof value === "number" ||
                value === null
            ) {
                acc[key] = value;
            }
            return acc;
        }, {});
    };

    const handleRowClick = (type: string, data: UserData | Event | Group) => {
        if (userData?.role === "SUPER_ADMIN" || userData?.role === "ADMIN" ) {
            const editableData = toEditFormData(data);

            setFormData(editableData);
            setOriginalData(editableData);
            setUpdatePopup({
                open: true,
                type,
                selectedRow: data,
                onConfirm: () => setUpdatePopup({
                    open: false,
                    type: "",
                    selectedRow: null,
                })
            });
        }
        
    };

    const renderInputByType = (
        key: FieldKey,
        value: string,
        onChange: (value: string) => void
    ) => {
        const config = FIELD_CONFIG[key];

        if (config.type === "select" && "options" in config) {
            return (
                <select
                    value={value}
                    disabled={!config.editable}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {config.options.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            );
        }

        return (
            <input
                type={config.type}
                value={value}
                readOnly={!config.editable}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    };

    const isChanged = useMemo(() => {
        return Object.keys(formData).some(
            (key) => formData[key] !== originalData[key]
        );
    }, [formData, originalData]);

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

    const closeUpdatePopup = () => {
        setUpdatePopup({
            open: false,
            type: "",
            selectedRow: null,
        });
    };

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
                
                {!userData && <p className={styles.infoMessage}>로그인 후 이용 가능합니다.</p> }
                {userData && 
                    <div className={styles.selectContainer}>
                        <div className={styles.select} ref={ref}>
                            <button
                                type="button"
                                className={styles.trigger}
                                onClick={() => setOpen((v) => !v)}
                            >
                                {selectSearch.name}
                                <span className={styles.arrow}></span>
                            </button>

                            {open && (
                                <ul className={styles.dropdown}>
                                    {selectList.map((item, i) => (
                                        <li
                                            key={`search-select-${i}`}
                                            className={selectSearch.id === item.id ? styles.active : ""}
                                            onClick={() => {
                                                setSelectSearch(item);
                                                setOpen(false);
                                            }}
                                        >
                                            {item.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <input
                            className={styles.searchInput} 
                            placeholder="검색" value={keyword} 
                            onChange={e => setKeyword(e.target.value)} 
                            onKeyDown={handleSearch}
                        />
                    </div>
                }
                

                {
                    (userData?.role === "SUPER_ADMIN" || userData?.role === "ADMIN") 
                    && userListData?.data 
                    && !(isSearching && !userListKeyword)
                    &&
                    <DataTable
                        name="사용자"
                        data={userListData.data}
                        columns={userListColumns}
                        page={userListPagination.page}
                        setPage={(p) =>
                            userListPagination.movePage(p, userListData.nextCursor)
                        }
                        hasNextPage={userListData.hasNextPage}
                        onRowClick={handleRowClick}
                    />
                }
                {groupsData?.data && !(isSearching && !groupsKeyword) && 
                    <DataTable 
                        name="그룹"
                        data={groupsData.data} 
                        columns={groupColumns}
                        page={groupsPagination.page}
                        setPage={(p) =>
                            groupsPagination.movePage(p, groupsData.nextCursor)
                        }
                        hasNextPage={groupsData.hasNextPage}
                        onRowClick={handleRowClick}
                    />
                }
                {eventsData?.data && !(isSearching && !eventsKeyword) && 
                    <DataTable 
                        name="일정"
                        data={eventsData.data} 
                        columns={eventColumns}
                        page={eventsPagination.page}
                        setPage={(p) =>
                            eventsPagination.movePage(p, eventsData.nextCursor)
                        }
                        hasNextPage={eventsData.hasNextPage}
                        onRowClick={handleRowClick}
                    />
                }

                {userData && userData?.role !== "USER" && (
                    <Dashboard role={userData.role} />
                )}

            </div>
            <Footer />
            {updatePopup.open &&
                <div className={styles.alertOverlay}>
                    <div className={styles.alert}>
                        <div className={styles.alertHeader}>수정</div>
                        <div className={styles.alertBody}>
                            {Object.entries(formData).map(([key, value]) => {
                                if (!(key in FIELD_CONFIG)) return null;

                                const typedKey = key as FieldKey;
                                const config = FIELD_CONFIG[typedKey];

                                return (
                                    <div key={key} className={styles.inputText}>
                                    <label>{config.label}</label>

                                    {renderInputByType(
                                        typedKey,
                                        String(value ?? ""),
                                        (newValue) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            [typedKey]: newValue,
                                        }))
                                    )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className={styles.buttonContainer}>
                            <button className={styles.cancelButton} onClick={closeUpdatePopup}>취소</button>
                            <button className={styles.approveButton} onClick={updatePopup.onConfirm}>확인</button>
                        </div>
                    </div>
                </div>
            }
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