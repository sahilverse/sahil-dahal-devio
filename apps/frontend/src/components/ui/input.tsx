import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, onChange, ...props }, ref) => {
        return (
            <div className="w-full relative group">
                <input
                    type={type}
                    className={cn(
                        "peer flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-destructive focus-visible:ring-destructive",
                        className
                    )}
                    placeholder=" "
                    ref={ref}
                    onChange={onChange}
                    {...props}
                />
                {label && (
                    <label className={cn(
                        "absolute left-3 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-background px-1 text-sm text-muted-foreground duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-1 peer-focus:text-foreground cursor-text pointer-events-none",
                        error && "text-destructive peer-focus:text-destructive"
                    )}>
                        {label}
                    </label>
                )}
                {error && (
                    <p className="text-xs font-medium text-destructive mt-1.5 ml-1">{error}</p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
