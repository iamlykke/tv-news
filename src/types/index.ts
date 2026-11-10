// JSON-формы, которые API отдаёт клиенту (даты — строки ISO)

export type TUserRole = 'ROLE_ADMIN' | 'ROLE_FULL_ADMIN';

export type TScreen = {
    id: number;
    slug: string;
    name: string;
    timezone: string;
};

export type TSlideStatus = 'live' | 'hidden' | 'scheduled' | 'expired' | 'deleted';

export type TSlide = {
    id: number;
    url: string;
    storagePath: string;
    isVideo: boolean;
    isHidden: boolean;
    isDeleted: boolean;
    showAfter: string | null;
    deleteAfter: string | null;
    createdAt: string;
    status: TSlideStatus;
    screen: { slug: string; name: string };
};

export type TPerson = {
    id: number;
    fullName: string;
    photoPath: string | null;
    photoUrl: string | null;
    /** yyyy-MM-dd */
    dateOfBirth: string | null;
    /** yyyy-MM-dd */
    startDate: string | null;
    isActive: boolean;
    screenId: number | null;
    screen: { slug: string; name: string } | null;
};

export type TBirthday = {
    personId: number;
    fullName: string;
    photoUrl: string | null;
    /** "10 November" */
    dateLabel: string;
};

export type TAnniversary = {
    personId: number;
    fullName: string;
    photoUrl: string | null;
    years: number;
};

export type TCelebrations = {
    birthdays: TBirthday[];
    anniversaries: TAnniversary[];
};

export type TUser = {
    id: number;
    email: string;
    role: TUserRole;
};
