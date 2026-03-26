import { PaymentProvider } from "../../../generated/prisma/client";

export interface PaymentInitiationResult {
    /** Config payload the frontend needs to redirect to the gateway */
    gatewayConfig: Record<string, unknown>;
    /** The URL to redirect the user to */
    gatewayUrl: string;
}

export interface PaymentVerificationResult {
    /** Whether the payment was verified successfully */
    success: boolean;
    /** Provider-specific transaction reference ID */
    providerRefId?: string;
    /** Raw response data from the provider (stored as metadata) */
    rawResponse: Record<string, unknown>;
    /** Reason for failure, if any */
    failureReason?: string;
}

export interface IPaymentGateway {
    /** The provider this gateway handles */
    readonly provider: PaymentProvider;

    /**
     * Build the gateway-specific initiation payload.
     * @param totalAmount - The final amount to charge
     * @param transactionUuid - Unique transaction ID
     * @returns Config object for the frontend and the gateway URL.
     */
    initiate(totalAmount: number, transactionUuid: string): PaymentInitiationResult;

    /**
     * Verify a callback/response from the payment gateway.
     * @param data - Raw data from the gateway callback (query params, body, etc.)
     * @returns Verification result with success status and metadata.
     */
    verify(data: string): Promise<PaymentVerificationResult>;
}
