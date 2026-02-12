import { z } from "zod";

const fileSchema = z.custom<any>((val) => {
    return val && typeof val === 'object' && 'fieldname' in val;
}, "Invalid file");

export const startConversationSchema = z.object({
    recipientId: z.cuid(),
    message: z.string().min(1, "Initial message is required").max(2000),
});

export const sendMessageSchema = z.object({
    content: z.string().max(2000).optional(),
    media: z.array(fileSchema).max(10, "Maximum 10 attachments allowed").optional(),
}).refine(data => data.content || (data.media && data.media.length > 0), {
    message: "Message must contain either text or media",
    path: ["content"]
});

export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
