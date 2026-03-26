"use client";

const STORAGE_KEY = "devio_active_payment_intent";

export const PaymentSession = {

    start: (transactionUuid: string) => {
        if (typeof window === "undefined") return;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
            uuid: transactionUuid,
            timestamp: Date.now()
        }));
    },

    isValid: (transactionUuid?: string) => {
        if (typeof window === "undefined") return false;
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return false;

        try {
            const data = JSON.parse(raw);
            const isExpired = Date.now() - data.timestamp > 1000 * 60 * 30;
            if (isExpired) {
                sessionStorage.removeItem(STORAGE_KEY);
                return false;
            }

            if (transactionUuid && data.uuid !== transactionUuid) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    },


    clear: () => {
        if (typeof window === "undefined") return;
        sessionStorage.removeItem(STORAGE_KEY);
    }
};
