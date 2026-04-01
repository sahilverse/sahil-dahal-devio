"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gift, Loader2, CheckCircle2, AlertCircle, ExternalLink, Coins } from "lucide-react";
import { useCipherBalance } from "@/hooks/useCipher";

// ─── Generic Props ─────────────────────────────────────────

export interface CheckoutItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    meta?: { label: string; value: string };
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: CheckoutItem | null;
    title?: string;
    icon?: React.ReactNode;
    confirmLabel?: string;
    promoEnabled?: boolean;
    maxCipherDiscount?: number;
    isLoading?: boolean;
    onConfirm: (item: CheckoutItem, promoCode?: string, cipherAmount?: number) => void;
    onValidatePromo?: (code: string, itemId: string) => Promise<{ discount: number }>;
}

export default function CheckoutModal({
    isOpen,
    onClose,
    item,
    title = "Complete Purchase",
    icon,
    confirmLabel = "Confirm",
    promoEnabled = true,
    maxCipherDiscount = 0,
    isLoading = false,
    onConfirm,
    onValidatePromo,
}: CheckoutModalProps) {
    const { data: userBalance = 0 } = useCipherBalance();

    // ─── Local State ───────────────────────────────────────
    const [promoCode, setPromoCode] = useState("");
    const [cipherAmount, setCipherAmount] = useState(0);
    const [isValidating, setIsValidating] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [promoSuccess, setPromoSuccess] = useState(false);

    // Reset ALL state whenever the modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setPromoCode("");
            setDiscount(0);
            setPromoError(null);
            setPromoSuccess(false);
            setIsValidating(false);
            setCipherAmount(0);
        }
    }, [isOpen]);

    if (!item) return null;

    const finalPrice = Math.max(0, item.price - discount - cipherAmount);
    const maxApplicableCiphers = Math.min(userBalance, maxCipherDiscount || item.price);

    const handleApplyPromo = async () => {
        if (!promoCode.trim() || !onValidatePromo) return;

        setIsValidating(true);
        setPromoError(null);
        setPromoSuccess(false);

        try {
            const result = await onValidatePromo(promoCode, item.id);
            const discountAmt = Number(((item.price * result.discount) / 100).toFixed(2));
            setDiscount(discountAmt);
            setPromoSuccess(true);
        } catch (err: any) {
            setPromoError(err?.errorMessage || "Invalid or expired promo code");
            setDiscount(0);
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-card border-default">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {icon}
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        You are purchasing{" "}
                        <span className="text-foreground font-semibold">{item.name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Item Summary */}
                    <div className="bg-muted/50 p-4 rounded-xl border border-default space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Package</span>
                            <span className="font-medium text-foreground">{item.name}</span>
                        </div>
                        {item.meta && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{item.meta.label}</span>
                                <Badge
                                    variant="secondary"
                                    className="bg-brand-primary/10 text-brand-primary border-0"
                                >
                                    {item.meta.value}
                                </Badge>
                            </div>
                        )}
                        <div className="h-px bg-border" />
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-sm font-medium">
                                Original Price
                            </span>
                            <span className="font-bold text-foreground">
                                {item.currency || "NPR"} {item.price}
                            </span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between items-center text-green-500 animate-in fade-in slide-in-from-top-1">
                                <span className="text-sm font-medium">Promo Discount</span>
                                <span className="font-bold">
                                    - {item.currency || "NPR"} {discount.toFixed(2)}
                                </span>
                            </div>
                        )}
                        {cipherAmount > 0 && (
                            <div className="flex justify-between items-center text-brand-primary animate-in fade-in slide-in-from-top-1">
                                <span className="text-sm font-medium">Cipher Discount</span>
                                <span className="font-bold">
                                    - {item.currency || "NPR"} {cipherAmount.toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Elective Cipher Discount */}
                    {maxCipherDiscount > 0 && userBalance > 0 && (
                        <div className="space-y-3 p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs font-bold uppercase text-brand-primary tracking-wider flex items-center gap-2">
                                    <Coins className="w-3 h-3" />
                                    Use Ciphers
                                </Label>
                                <span className="text-[10px] font-bold text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-default">
                                    Balance: {userBalance}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min="0"
                                    max={maxApplicableCiphers}
                                    step="1"
                                    value={cipherAmount}
                                    onChange={(e) => setCipherAmount(Number(e.target.value))}
                                    className="w-full accent-brand-primary h-1.5 bg-brand-primary/20 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Applied: {cipherAmount}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Limit: {maxApplicableCiphers}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Promo Code Section */}
                    {promoEnabled && onValidatePromo && (
                        <div className="space-y-3">
                            <Label
                                htmlFor="promo"
                                className="text-xs font-semibold uppercase text-muted-foreground tracking-wider"
                            >
                                Promotion Code
                            </Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Gift className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="promo"
                                        placeholder="Enter code"
                                        className="pl-9 bg-muted/30 border-default"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        disabled={isValidating || promoSuccess}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleApplyPromo}
                                    disabled={!promoCode.trim() || isValidating || promoSuccess}
                                    className="min-w-[80px]"
                                >
                                    {isValidating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Apply"
                                    )}
                                </Button>
                            </div>
                            {promoError && (
                                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {promoError}
                                </p>
                            )}
                            {promoSuccess && (
                                <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Promo code applied successfully!
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-3">
                    <div className="flex justify-between items-center w-full mb-2 bg-brand-primary/5 p-3 rounded-lg border border-brand-primary/10">
                        <span className="text-sm font-semibold text-brand-primary">
                            Total to Pay
                        </span>
                        <span className="text-xl font-bold text-brand-primary">
                            {item.currency || "NPR"} {finalPrice.toFixed(2)}
                        </span>
                    </div>
                    <Button
                        variant="brand"
                        className="w-full font-bold h-11 text-base"
                        onClick={() => onConfirm(item, promoSuccess ? promoCode : undefined, cipherAmount)}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        {isLoading ? "Redirecting..." : confirmLabel}
                    </Button>
                    <p className="text-center text-[10px] text-muted-foreground">
                        By proceeding, you agree to our Terms of Service and Refund Policy.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
