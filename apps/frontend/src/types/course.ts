
export interface Course {
    id: string;
    slug: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    price: number | null;
    createdAt: string;
    maxCipherDiscount: number | null;
    updatedAt: string;
    averageRating: number;
    duration: number;
    reviewCount: number;
    enrollmentCount: number;
    isEnrolled: boolean;
    progress?: number;
}

export interface Module {
    id: string;
    title: string;
    order: number;
    courseId: string;
    lessonCount: number;
    lessons: Lesson[];
}

export interface Lesson {
    id: string;
    title: string;
    slug: string;
    content: string | null;
    videoUrl: string | null;
    videoStatus: "READY" | "PROCESSING" | "FAILED" | null;
    duration: number | null;
    isPreview: boolean;
    order: number;
    moduleId: string;
    type: "VIDEO" | "TEXT";
    isCompleted?: boolean;
}

export interface CourseComment {
    id: string;
    lessonId: string;
    parentId: string | null;
    content: string;

    deletedAt: string | null;
    upvotes: number;
    downvotes: number;
    userVote: "UP" | "DOWN" | null;
    createdAt: string;
    user: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
    replies?: CourseComment[];
    replyCount: number;
}


export interface CourseReview {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        username: string;
        avatarUrl: string | null;
        firstName: string | null;
        lastName: string | null;
    };
}
