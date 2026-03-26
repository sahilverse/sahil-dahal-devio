import { injectable } from "inversify";
import crypto from "crypto";
import { PaymentProvider } from "../../../generated/prisma/client";
import { ApiError, logger } from "../../../utils";
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
        const fields = "total_amount,transaction_uuid,product_code";
        const data = {
            total_amount: String(totalAmount),
            transaction_uuid: transactionUuid,
            product_code: ESEWA_PRODUCT_CODE,
        };

        const signature = this.generateSignature(data, fields);

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
                signed_field_names: fields,
                signature,
            },
            gatewayUrl: ESEWA_GATEWAY_URL,
        };
    }

    async verify(encodedData: string): Promise<PaymentVerificationResult> {

        const decodedData = JSON.parse(
            Buffer.from(encodedData, "base64").toString("utf-8")
        );


        const {
            signature: receivedSignature,
            signed_field_names: fields,
            status,
            ref_id,
        } = decodedData;

        if (!fields || !receivedSignature) {
            throw new ApiError("Invalid eSewa response data", StatusCodes.BAD_REQUEST);
        }

        const expectedSignature = this.generateSignature(decodedData, fields);

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

    private generateSignature(data: Record<string, any>, fields: string): string {
        const message = fields
            .split(",")
            .map((field) => `${field}=${data[field]}`)
            .join(",");

        return crypto
            .createHmac("sha256", ESEWA_SECRET_KEY)
            .update(message)
            .digest("base64");
    }
}
