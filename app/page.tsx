"use client";
import { useState, useRef, useEffect, forwardRef } from "react";
import { SketchPicker, ColorResult } from "react-color";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
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
import type { UserData, Event, Member, Group } from "@/types";
import "react-datepicker/dist/react-datepicker.css";
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
        type: "text",
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
        type: "date",
        editable: true,
    },
    members: {
        label: "멤버",
        type: "array",
        editable: true,
    },
    inviteCode: {
        label: "초대 코드",
        type: "text",
        editable: false,
    },
    color: {
        label: "색상",
        type: "color",
        editable: true,
    },
    role: {
        label: "권한",
        type: "select",
        editable: true,
        options: [
            { label: "User", value: "USER" },
            { label: "Admin", value: "ADMIN" },
            { label: "Super Admin", value: "SUPER_ADMIN" },
        ]
    },
};

const EXCLUDED_FIELDS = new Set([
    "createdAt",
    "lastLogin",
    "updatedAt",
]);

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
};

type EditableValue = string | number | Member[] | null;

const isUser = (data: UserData | Event | Group): data is UserData => {
    return "email" in data;
};

const isGroup = (data: UserData | Event | Group): data is Group => {
    return "ownerId" in data;
};

const isEvent = (data: UserData | Event | Group): data is Event => {
    return "uid" in data && "date" in data;
};

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
    const [searchOpen, setSearchOpen] = useState<boolean>(false);
    const [optionOpen, setOptionOpen] = useState<boolean>(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const optionRef = useRef<HTMLDivElement>(null);
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [currentColor, setCurrentColor] = useState<string>("#000");
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const pendingColorRef = useRef<string | null>(null)

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
            if (EXCLUDED_FIELDS.has(key)) return acc;
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

    const fetchGroupMembers = async (groupId: string) => {
        try {
            const res = await fetch(`/api/members?groupId=${groupId}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    };

    const handleRowClick = async (type: string, data: UserData | Group | Event) => {
        if (
            // 관리자
            userData?.role === "SUPER_ADMIN"
            // 관리자 or 본인이 생성한 그룹
            || (isGroup(data) && (userData?.role === "ADMIN" || data.ownerId === userData?.uid))
            // 관리자 or 본인이 작성한 일정
            || (isEvent(data) && (userData?.role === "ADMIN" || data.uid === userData?.uid))
        ) {
            const editableData = toEditFormData(data);
            
            if (isGroup(data)) {
                const members = await fetchGroupMembers(data.id);
                editableData.members = members;
            }

            setFormData(editableData);
            setOriginalData(editableData);
            setUpdatePopup({
                open: true,
                type,
                selectedRow: data
            });
        } else {
            setShowAlert("수정 권한이 없습니다.");
        }
        
    };

    const renderInputByType = (
        key: FieldKey,
        value: EditableValue,
        onChange: (value: EditableValue) => void
    ) => {
        const config = FIELD_CONFIG[key];

        if (config.type === "color") {
            return (
                <div className={styles.colorPicker} ref={colorPickerRef}>
                    <button
                        type="button"
                        style={{ backgroundColor: typeof value === "string" 
                            ? value
                            : currentColor
                        }}
                        onClick={() => setShowColorPicker((v) => !v)}
                    ></button>
                    {showColorPicker && (
                        <div className={styles.colorPickerContainer}>
                            <SketchPicker
                                color={currentColor}
                                onChange={(color: ColorResult) => {
                                    const rgbValue = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
                                    pendingColorRef.current = rgbValue;
                                    setCurrentColor(rgbValue)
                                }}
                                onChangeComplete={(color: ColorResult) => {
                                    const rgbValue = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
                                    setFormData(prev => ({
                                        ...prev,
                                        color: rgbValue
                                    }));
                                    setShowColorPicker(false);
                                }}
                            />
                        </div>
                    )}
                </div>
            )
        }

        if (config.type === "date") {
            const selectedDate = value ? new Date(value as string) : null;
            const CustomDateInput = forwardRef
                <HTMLButtonElement, {
                    value?: string;
                    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
                }>(({ value, onClick }, ref) => (
                    <button
                        type="button"
                        className="dateButton"
                        onClick={onClick}
                        ref={ref}
                    >
                        {value || "날짜 선택"}
                    </button>
                )
            );
            CustomDateInput.displayName = "customDateInput";

            return (
                <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => {
                        if (date) onChange(date.toISOString().split("T")[0]);
                        else onChange(null);
                    }}
                    dateFormat="yyyy-MM-dd"
                    locale={ko}
                    customInput={<CustomDateInput />}
                    showPopperArrow={false}
                    calendarClassName="customCalendar"
                />
            );
        }

        if (config.type === "select" && "options" in config) {
            const selectedOption =
                typeof value === "string"
                    ? config.options.find(opt => opt.value === value)
                    : null;
            return (
                <div className={styles.select} ref={optionRef}>
                    <button
                        type="button"
                        className={styles.trigger}
                        onClick={() => setOptionOpen((v) => !v)}
                    >
                        {selectedOption?.label ?? ""}
                        <span className={`${styles.arrow} ${optionOpen ? styles.active : ""}`}></span>
                    </button>

                    {optionOpen && (
                        <ul className={styles.dropdown}>
                            {config.options.map((opt, i) => (
                                <li
                                    key={`search-select-${i}`}
                                    className={value === opt.value ? styles.active : ""}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOptionOpen(false);
                                    }}
                                >
                                    {opt.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            );
        }

        if (config.type === "array" && Array.isArray(value)) {
            return (
                <div className={styles.array}>
                    <ul className={styles.arrayContainer}>
                        {value.map((opt, i) => (
                            <li
                                key={`array-option-${i}`}
                            >
                                <span>{opt.name}</span>
                                {updatePopup.selectedRow &&
                                (isGroup(updatePopup.selectedRow) &&
                                    (userData?.role !== "SUPER_ADMIN" &&
                                        updatePopup.selectedRow.ownerId === userData?.uid
                                    ) &&
                                updatePopup.selectedRow.ownerId !== opt.uid
                                ) &&
                                    (
                                        <button
                                            type="button"
                                            className={styles.removeMemberButton}
                                            onClick={() => {
                                                setConfirmAlert({
                                                    open: true,
                                                    message: `${opt.name}을(를) 삭제하시겠습니까?`,
                                                    onConfirm: () => {
                                                        setFormData(prev => {
                                                            const members = Array.isArray(prev.members)
                                                                ? (prev.members as Member[])
                                                                : [];

                                                            return {
                                                                ...prev,
                                                                members: members.filter(m => m.uid !== opt.uid),
                                                            };
                                                        });
                                                        closeConfirmAlert();
                                                    },
                                                });
                                            }}
                                        >
                                            삭제
                                        </button>
                                    )
                                }
                            </li>
                        ))}
                    </ul>
                </div>
            )
        }

        return (
            <input
                id={`${key}`}
                name={key}
                type={config.type}
                value={
                    typeof value === "string" || typeof value === "number"
                        ? value
                        : ""
                }
                readOnly={!config.editable}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    };

    const handleUpdateConfirm = async () => {
        if (!isChanged(formData, originalData)) {
            return setShowAlert("변경된 내용이 없습니다.");
        }

        const ok = await handleRowUpdate();

        if (ok) {
            updateRowData(updatePopup.type);
            closeUpdatePopup();
            setShowAlert("수정되었습니다.");
        } else {
            setShowAlert("수정에 실패했습니다.");
        }
    };

    const handleRowUpdate = async (): Promise<boolean> => {
        if (!userData) return false;
        try {
            const res = await fetch("/api/admin/update", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: updatePopup.type,
                    user: userData,
                    data: formData,
                }),
            });
            
            return res.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const updateRowData = (type: string) => {
        switch (type) {
            case "users":
                if (!userListData?.data) return;
                    refetchUserList();
            break;

            case "groups":
                if (!groupsData?.data) return;
                    refetchGroups();
            break;

            case "events":
                if (!eventsData?.data) return;
                    refetchEvents();
            break;
        }
    };

    const isChanged = (
        current: Record<string, EditableValue>,
        original: Record<string, EditableValue>
    ) => {
        return Object.keys(current).some(
            (key) => current[key] !== original[key]
        );
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (optionRef.current && !optionRef.current.contains(e.target as Node)) {
                setOptionOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!colorPickerRef.current) return

            const target = event.target as Element | null
            if (!target) return

            const ignore = target.closest("[data-ignore-outside-click]")

            if (!ignore && !colorPickerRef.current.contains(target)) {
                if (pendingColorRef.current) {
                    pendingColorRef.current = null
                }

                setShowColorPicker(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

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
                        <div className={styles.select} ref={searchRef}>
                            <button
                                type="button"
                                className={styles.trigger}
                                onClick={() => setSearchOpen((v) => !v)}
                            >
                                {selectSearch.name}
                                <span className={`${styles.arrow} ${searchOpen ? styles.active : ""}`}></span>
                            </button>

                            {searchOpen && (
                                <ul className={styles.dropdown}>
                                    {selectList.map((item, i) => (
                                        <li
                                            key={`search-select-${i}`}
                                            className={selectSearch.id === item.id ? styles.active : ""}
                                            onClick={() => {
                                                setSelectSearch(item);
                                                setSearchOpen(false);
                                            }}
                                        >
                                            {item.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <input
                            id="searchInput"
                            name="searchInput"
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
                                        {config.type === "text"
                                            ? <label htmlFor={key} className={styles.label}>{config.label}</label>
                                            : <p className={styles.label}>{config.label}</p>
                                        }
                                        

                                        {renderInputByType(
                                            typedKey,
                                            value,
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
                            <button className={styles.approveButton} disabled={!isChanged(formData, originalData)} onClick={handleUpdateConfirm}>확인</button>
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