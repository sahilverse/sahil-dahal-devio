import { injectable } from "inversify";
import crypto from "crypto";
import { PaymentProvider } from "../../../generated/prisma/client";
import { ApiError } from "../../../utils";
import { StatusCodes } from "http-status-codes";
import {
    ESEWA_SECRET_KEY,
    ESEWA_PRODUCT_CODE,
    ESEWA_GATEWAY_URL,
    CLIENT_URL,
} from "../../../config/constants";
import type {
    IPaymentGateway,
    PaymentInitiationResult,
    PaymentVerificationResult,
} from "./payment-gateway.interface";

@injectable()
export class EsewaGateway implements IPaymentGateway {
    readonly provider = PaymentProvider.ESEWA;

    initiate(totalAmount: number, transactionUuid: string): PaymentInitiationResult {
        const signature = this.generateSignature(totalAmount, transactionUuid);

        return {
            gatewayConfig: {
                amount: totalAmount,
                tax_amount: 0,
                total_amount: totalAmount,
                transaction_uuid: transactionUuid,
                product_code: ESEWA_PRODUCT_CODE,
                product_service_charge: 0,
                product_delivery_charge: 0,
                success_url: `${CLIENT_URL}/payments/verify`,
                failure_url: `${CLIENT_URL}/payments/failed`,
                signed_field_names: "total_amount,transaction_uuid,product_code",
                signature,
            },
            gatewayUrl: ESEWA_GATEWAY_URL,
        };
    }

    async verify(encodedData: unknown): Promise<PaymentVerificationResult> {
        if (typeof encodedData !== "string") {
            throw new ApiError("Invalid eSewa response data", StatusCodes.BAD_REQUEST);
        }

        const decodedData = JSON.parse(
            Buffer.from(encodedData, "base64").toString("utf-8")
        );
        const {
            transaction_uuid,
            total_amount,
            status,
            ref_id,
            signature: receivedSignature,
        } = decodedData;

        if (!transaction_uuid || !total_amount || !status) {
            throw new ApiError("Invalid eSewa response data", StatusCodes.BAD_REQUEST);
        }

        // Verify signature integrity
        const expectedSignature = this.generateSignature(
            Number(total_amount),
            transaction_uuid
        );

        if (receivedSignature !== expectedSignature) {
            return {
                success: false,
                rawResponse: decodedData,
                failureReason: "eSewa signature mismatch",
            };
        }

        if (status !== "COMPLETE") {
            return {
                success: false,
                rawResponse: decodedData,
                failureReason: `eSewa returned status: ${status}`,
            };
        }

        return {
            success: true,
            providerRefId: ref_id,
            rawResponse: decodedData,
        };
    }

    private generateSignature(totalAmount: number, transactionUuid: string): string {
        const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
        return crypto
            .createHmac("sha256", ESEWA_SECRET_KEY)
            .update(message)
            .digest("base64");
    }
}
