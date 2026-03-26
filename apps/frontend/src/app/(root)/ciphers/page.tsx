"use client";

import { useState, useCallback } from "react";
import {
    Coins,
    Zap,
    ShieldCheck,
    Gift,
    Sparkles,
    ArrowRight,
    ShoppingBag,
    Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CheckoutModal, { type CheckoutItem } from "@/components/shared/CheckoutModal";
import { useCipherPackages } from "@/hooks/useCipher";
import { useInitiatePayment } from "@/hooks/usePayment";
import { useValidatePromo } from "@/hooks/usePromo";
import type { CipherPackage } from "@/api/cipherService";
import { PaymentSession } from "@/lib/payment-session";
import { useAppSelector } from "@/store/hooks";
import { useAuthModal } from "@/contexts/AuthModalContext";

// Icon mapping by index for visual differentiation
const TIER_ICONS = [Zap, Coins, ShieldCheck, Sparkles];
const TIER_COLORS = [
    { text: "text-blue-400", bg: "bg-blue-400/10" },
    { text: "text-brand-primary", bg: "bg-brand-primary/10" },
    { text: "text-emerald-400", bg: "bg-emerald-400/10" },
    { text: "text-orange-400", bg: "bg-orange-400/10" },
];

export default function CipherStorePage() {
    const { user } = useAppSelector((state) => state.auth);
    const { openLogin } = useAuthModal();

    const { data: packages, isLoading, error } = useCipherPackages();
    const initiatePayment = useInitiatePayment();
    const validatePromo = useValidatePromo();

    const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleBuyNow = (pkg: CipherPackage) => {
        if (!user) {
            openLogin();
            return;
        }

        setSelectedItem({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            price: Number(pkg.price),
            currency: pkg.currency || "NPR",
            meta: { label: "Ciphers", value: `${pkg.points} Ciphers` },
        });
        setIsModalOpen(true);
    };

    const handleValidatePromo = useCallback(
        async (code: string, itemId: string) => {
            const result = await validatePromo.mutateAsync({ code, packageId: itemId });
            return { discount: result.discount };
        },
        [validatePromo]
    );

    const handleConfirm = useCallback(
        async (item: CheckoutItem, promoCode?: string) => {
            try {
                const result = await initiatePayment.mutateAsync({
                    packageId: item.id,
                    promoCode,
                });

                const form = document.createElement("form");
                form.method = "POST";
                form.action = result.gatewayUrl;

                Object.entries(result.gatewayConfig).forEach(([key, value]) => {
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                });

                document.body.appendChild(form);

                PaymentSession.start(result.gatewayConfig.transaction_uuid);

                setIsRedirecting(true);
                form.submit();
            } catch (error: any) {
                console.error("Payment initiation failed:", error);
                setIsRedirecting(false);
            }
        },
        [initiatePayment]
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
            {/* Hero Section */}
            <header className="text-center space-y-4 max-w-2xl mx-auto">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-medium"
                >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Cipher Store</span>
                </motion.div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Power your experience with{" "}
                    <span className="text-brand-primary">Cipher</span>
                </h1>
                <p className="text-muted-foreground text-lg">
                    Fuel your journey — set bounties on questions, participate in exclusive events,
                    and extend your lab environment run-time.
                </p>
            </header>

            {/* Loading / Error States */}
            {isLoading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                </div>
            )}

            {error && (
                <div className="text-center py-12 space-y-3">
                    <p className="text-destructive font-medium">
                        Failed to load packages. Please try again.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Package Grid */}
            {packages && packages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {packages.map((pkg, idx) => {
                        const Icon = TIER_ICONS[idx % TIER_ICONS.length];
                        const colors = TIER_COLORS[idx % TIER_COLORS.length];

                        return (
                            <motion.div
                                key={pkg.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card
                                    className={`relative overflow-hidden group transition-all hover:border-brand-primary/50 h-full flex flex-col ${pkg.isFeatured
                                        ? "ring-2 ring-brand-primary/20 border-brand-primary/30"
                                        : ""
                                        } ${idx === packages.length - 1
                                            ? "bg-gradient-to-br from-card to-brand-primary/5"
                                            : ""
                                        }`}
                                >
                                    {pkg.isFeatured && (
                                        <div className="absolute top-0 right-0">
                                            <Badge className="rounded-none rounded-bl-lg bg-brand-primary hover:bg-brand-primary">
                                                Popular
                                            </Badge>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <div
                                            className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-2`}
                                        >
                                            <Icon className={`w-6 h-6 ${colors.text}`} />
                                        </div>
                                        <CardTitle className="text-xl font-bold">
                                            {pkg.name}
                                        </CardTitle>
                                        <CardDescription>{pkg.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 flex-1">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-foreground">
                                                {pkg.points.toLocaleString()}
                                            </span>
                                            <span className="text-muted-foreground text-sm font-medium">
                                                Ciphers
                                            </span>
                                        </div>
                                        <div className="h-px bg-border" />
                                        <div className="text-xl font-semibold text-brand-primary">
                                            {pkg.currency || "NPR"} {Number(pkg.price).toLocaleString()}
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            variant={
                                                pkg.isFeatured || idx === packages.length - 1
                                                    ? "brand"
                                                    : "outline"
                                            }
                                            className="w-full font-bold group"
                                            onClick={() => handleBuyNow(pkg)}
                                        >
                                            Buy Now
                                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {packages && packages.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No packages available right now.</p>
                    <p className="text-sm">Check back soon!</p>
                </div>
            )}

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsRedirecting(false);
                }}
                item={selectedItem}
                title="Complete Purchase"
                icon={<Coins className="w-6 h-6 text-brand-primary" />}
                confirmLabel="Proceed"
                promoEnabled
                isLoading={initiatePayment.isPending || isRedirecting}
                onConfirm={handleConfirm}
                onValidatePromo={handleValidatePromo}
            />

            {/* Trust Footer */}
            <footer className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-default py-12">
                <div className="space-y-2 px-4">
                    <ShieldCheck className="w-8 h-8 mx-auto text-brand-primary" />
                    <h3 className="font-semibold">Secure Gateway</h3>
                    <p className="text-xs text-muted-foreground px-4">
                        Encrypted payments processed through trusted payment partners.
                    </p>
                </div>
                <div className="space-y-2 px-4">
                    <Zap className="w-8 h-8 mx-auto text-brand-primary" />
                    <h3 className="font-semibold">Instant Credit</h3>
                    <p className="text-xs text-muted-foreground px-4">
                        Ciphers are added to your balance immediately after verification.
                    </p>
                </div>
                <div className="space-y-2 px-4">
                    <Gift className="w-8 h-8 mx-auto text-brand-primary" />
                    <h3 className="font-semibold">Daily Rewards</h3>
                    <p className="text-xs text-muted-foreground px-4">
                        Earn extra ciphers by solving problems on the platform daily.
                    </p>
                </div>
            </footer>
        </div>
    );
}
