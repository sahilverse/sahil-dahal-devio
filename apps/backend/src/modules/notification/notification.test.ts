import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Container } from "inversify";
import { NotificationService } from "./notification.service";
import { TYPES } from "../../types";
import { NotificationType } from "../../generated/prisma/client";

describe("NotificationService Unit Tests", () => {
    let container: Container;
    let notificationService: NotificationService;
    let mockNotificationRepository: any;
    let mockSocketService: any;

    const MOCK_USER_ID = "user-123";
    const MOCK_NOTIF_ID = "notif-456";

    beforeEach(() => {
        container = new Container();

        // 1. Mock Repository
        mockNotificationRepository = {
            create: vi.fn(),
            findByUserId: vi.fn(),
            markAsRead: vi.fn(),
            markAllAsRead: vi.fn(),
            countUnread: vi.fn(),
        };

        // 2. Mock SocketService with chained methods
        const mockEmit = vi.fn();
        const mockTo = vi.fn().mockReturnValue({ emit: mockEmit });
        mockSocketService = {
            get io() {
                return { to: mockTo };
            }
        };

        // 3. Bind dependencies
        container.bind(TYPES.NotificationRepository).toConstantValue(mockNotificationRepository);
        container.bind(TYPES.SocketService).toConstantValue(mockSocketService);
        container.bind(NotificationService).to(NotificationService);

        notificationService = container.get(NotificationService);
        vi.clearAllMocks();
    });

    describe("notify()", () => {
        const notifData = {
            userId: MOCK_USER_ID,
            type: NotificationType.SYSTEM,
            message: "Test message",
            title: "Test Title"
        };

        it("should create a notification and emit it via Socket.io", async () => {
            const mockDbRecord = { id: MOCK_NOTIF_ID, ...notifData, createdAt: new Date() };
            mockNotificationRepository.create.mockResolvedValue(mockDbRecord);

            const result = await notificationService.notify(notifData);

            expect(mockNotificationRepository.create).toHaveBeenCalledWith(notifData);

            // Verify Socket Emission
            expect(mockSocketService.io.to).toHaveBeenCalledWith(`user:${MOCK_USER_ID}`);
            expect(mockSocketService.io.to().emit).toHaveBeenCalledWith(
                "notification:new",
                expect.objectContaining({
                    id: MOCK_NOTIF_ID,
                    message: "Test message"
                })
            );

            expect(result).toEqual(mockDbRecord);
        });

        it("should not fail if socket emission throws an error", async () => {
            const mockDbRecord = { id: MOCK_NOTIF_ID, ...notifData, createdAt: new Date() };
            mockNotificationRepository.create.mockResolvedValue(mockDbRecord);

            mockSocketService.io.to().emit.mockImplementation(() => {
                throw new Error("Socket error");
            });

            const result = await notificationService.notify(notifData);

            expect(result).toEqual(mockDbRecord);
            expect(mockNotificationRepository.create).toHaveBeenCalled();
        });
    });

    describe("State Management", () => {
        it("should mark a single notification as read", async () => {
            mockNotificationRepository.markAsRead.mockResolvedValue({ id: MOCK_NOTIF_ID, read_at: new Date() });

            await notificationService.markRead(MOCK_NOTIF_ID, MOCK_USER_ID);

            expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith(MOCK_NOTIF_ID, MOCK_USER_ID);
        });

        it("should mark all user notifications as read", async () => {
            await notificationService.markAllRead(MOCK_USER_ID);

            expect(mockNotificationRepository.markAllAsRead).toHaveBeenCalledWith(MOCK_USER_ID);
        });

        it("should get unread notification count", async () => {
            mockNotificationRepository.countUnread.mockResolvedValue(5);

            const count = await notificationService.getUnreadCount(MOCK_USER_ID);

            expect(count).toBe(5);
            expect(mockNotificationRepository.countUnread).toHaveBeenCalledWith(MOCK_USER_ID);
        });
    });
});
