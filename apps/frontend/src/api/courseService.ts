import api from "./axios";
import { Course, Module, Lesson, CourseComment, CourseReview } from "@/types/course";

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
        const response = await api.get(`/courses/${slug}`);
        return response.data.result;
    },


    async getCourseModules(courseId: string, params: { limit?: number; cursor?: string } = {}): Promise<PaginatedResponse<Module>> {
        const response = await api.get(`/courses/${courseId}/modules`, { params });
        return response.data.result;
    },

    async getLessonById(lessonId: string): Promise<Lesson> {
        const response = await api.get(`/courses/lessons/${lessonId}/content`);
        return response.data.result;
    },

    async enrollInCourse(courseId: string): Promise<void> {
        await api.post(`/courses/${courseId}/enroll`);
    },

    async getMyEnrollments(params?: { cursor?: string; limit?: number }): Promise<PaginatedResponse<Course>> {
        const response = await api.get("/courses/my-enrollments", { params });
        return response.data.result;
    },

    async getCourseReviews(courseId: string, params: { limit?: number; cursor?: string } = {}): Promise<PaginatedResponse<CourseReview> & { averageRating: number; totalReviews: number }> {
        const response = await api.get(`/courses/${courseId}/reviews`, { params });
        return response.data.result;
    },

    async postCourseReview(courseId: string, data: { rating: number; comment?: string }): Promise<CourseReview> {
        const response = await api.post(`/courses/${courseId}/reviews`, data);
        return response.data.result;
    },

    // ─── Comments ──────────────────────────────────────────

    async getLessonComments(lessonId: string, params: { limit?: number; cursor?: string; sort?: "best" | "newest" | "oldest" }): Promise<PaginatedResponse<CourseComment>> {
        const response = await api.get(`/courses/lessons/${lessonId}/comments`, { params });
        return response.data.result;
    },

    async getCommentReplies(lessonId: string, commentId: string, params: { limit?: number; cursor?: string }): Promise<PaginatedResponse<CourseComment>> {
        const response = await api.get(`/courses/lessons/${lessonId}/comments/${commentId}/replies`, { params });
        return response.data.result;
    },

    async postComment(lessonId: string, data: { content: string; parentId?: string }): Promise<CourseComment> {
        const response = await api.post(`/courses/lessons/${lessonId}/comments`, data);
        return response.data.result;
    },

    async updateComment(commentId: string, content: string): Promise<CourseComment> {
        const response = await api.patch(`/courses/lessons/comments/${commentId}`, { content });
        return response.data.result;
    },

    async deleteComment(commentId: string): Promise<void> {
        await api.delete(`/courses/lessons/comments/${commentId}`);
    },

    async voteComment(commentId: string, type: "UP" | "DOWN" | null): Promise<CourseComment> {
        const response = await api.post(`/courses/lessons/comments/${commentId}/vote`, { type });
        return response.data.result;
    },

    async resolveLesson(slug: string, lessonId: string): Promise<{ lessonId: string }> {
        const response = await api.get(`/courses/${slug}/lessons/${lessonId}/resolve`);
        return response.data.result;
    },

    async updateLessonProgress(lessonId: string, isCompleted: boolean): Promise<void> {
        await api.post(`/courses/lessons/${lessonId}/progress`, { isCompleted });
    },

    async getCourseProgress(courseId: string): Promise<{ percentage: number; completedLessonIds: string[] }> {
        const response = await api.get(`/courses/${courseId}/progress`);
        return response.data.result;
    }
};
