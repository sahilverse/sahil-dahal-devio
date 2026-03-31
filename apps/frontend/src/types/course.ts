
export interface Course {
    id: string;
    slug: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    price: number | null;
    instructorId: string;
    instructor: {
        id: string;
        username: string;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
    };
    createdAt: string;
    updatedAt: string;
    _count?: {
        enrollments: number;
        modules: number;
    }
}

export interface Module {
    id: string;
    title: string;
    order: number;
    courseId: string;
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
}

export interface CourseComment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
    replies?: CourseComment[];
    replyCount: number;
}
