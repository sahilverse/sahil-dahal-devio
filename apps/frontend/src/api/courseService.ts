import api from "./axios";
import { Course, Module, Lesson, CourseComment } from "@/types/course";

export interface GetCoursesParams {
    limit?: number;
    cursor?: string;
    topic?: string;
    isFree?: boolean;
    search?: string;
    sortBy?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    nextCursor: string | null;
}

export const courseService = {
    async getCourses(params: GetCoursesParams = {}): Promise<PaginatedResponse<Course>> {
        const response = await api.get("/courses", { params });
        return response.data.result;
    },

    async getCourseBySlug(slug: string): Promise<Course> {
        const response = await api.get(`/courses/slug/${slug}`);
        return response.data.result;
    },

    async getCourseById(id: string): Promise<Course> {
        const response = await api.get(`/courses/${id}`);
        return response.data.result;
    },

    async getCourseModules(courseId: string): Promise<Module[]> {
        const response = await api.get(`/courses/${courseId}/modules`);
        return response.data.result.items;
    },

    async getLessonById(lessonId: string): Promise<Lesson> {
        const response = await api.get(`/courses/lessons/${lessonId}`);
        return response.data.result;
    },

    async enrollInCourse(courseId: string): Promise<void> {
        await api.post(`/courses/${courseId}/enroll`);
    },

    async getMyEnrollments(params?: { cursor?: string; limit?: number }): Promise<{ items: Course[]; nextCursor?: string }> {
        const response = await api.get("/courses/my-enrollments", { params });
        return response.data.result;
    },

    // ─── Comments ──────────────────────────────────────────

    async getLessonComments(lessonId: string, params: { limit?: number; cursor?: string; parentId?: string }): Promise<PaginatedResponse<CourseComment>> {
        const response = await api.get(`/courses/lessons/${lessonId}/comments`, { params });
        return response.data.result;
    },

    async postComment(lessonId: string, data: { content: string; parentId?: string }): Promise<CourseComment> {
        const response = await api.post(`/courses/lessons/${lessonId}/comments`, data);
        return response.data.result;
    }
};
