"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormTextareaProps {
    id: string;
    label: string;
    placeholder?: string;
    maxLength: number;
    className?: string;
    containerClassName?: string;
    register: any;
    watchValue?: string;
    error?: any;
    required?: boolean;
}

export function FormTextarea({
    id,
    label,
    placeholder,
    maxLength,
    className,
    containerClassName,
    register,
    watchValue = "",
    error,
    required = false,
}: FormTextareaProps) {
    const currentLength = watchValue?.length || 0;

    return (
        <div className={cn("space-y-2", containerClassName)}>
            <div className="flex justify-between items-center ml-0.5">
                <Label htmlFor={id} className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground/70">
                    {label}{required && " *"}
                </Label>
                <span className={cn(
                    "text-[10px] tabular-nums font-medium transition-colors",
                    currentLength > maxLength ? "text-destructive" : "text-muted-foreground/60"
                )}>
                    {currentLength}/{maxLength}
                </span>
            </div>
            <Textarea
                id={id}
                placeholder={placeholder}
                className={cn(
                    "min-h-[100px] bg-zinc-50/50 dark:bg-muted/20 border-zinc-300 dark:border-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all rounded-md text-sm text-foreground placeholder:text-muted-foreground/70 resize-y",
                    error && "border-destructive/50 focus:ring-destructive/20",
                    className
                )}
                {...register}
            />
            {error && (
                <p className="text-[10px] font-medium text-destructive ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {error.message}
                </p>
            )}
        </div>
    );
}
