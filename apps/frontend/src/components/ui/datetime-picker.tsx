"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    className?: string;
}

export function DateTimePicker({ date, setDate, className }: DateTimePickerProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
    const [timeValue, setTimeValue] = React.useState<string>("00:00");

    React.useEffect(() => {
        if (date) {
            setSelectedDate(date);
            setTimeValue(format(date, "HH:mm"));
        }
    }, [date]);

    const handleDateSelect = (newDate: Date | undefined) => {
        if (!newDate) {
            setDate(undefined);
            setSelectedDate(undefined);
            return;
        }

        const [hours, minutes] = timeValue.split(":").map(Number);
        newDate.setHours(hours || 0);
        newDate.setMinutes(minutes || 0);

        setSelectedDate(newDate);
        setDate(newDate);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = e.target.value;
        setTimeValue(time);

        if (selectedDate) {
            const [hours, minutes] = time.split(":").map(Number);
            const newDate = new Date(selectedDate);
            newDate.setHours(hours || 0);
            newDate.setMinutes(minutes || 0);
            setDate(newDate);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal h-12 rounded-xl border-border/50",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP p") : <span>Pick a date and time</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background border-border/50 shadow-xl" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="p-3 pointer-events-auto"
                />
                <div className="p-3 border-t border-border/50 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Input
                        type="time"
                        value={timeValue}
                        onChange={handleTimeChange}
                        className="h-9 w-full rounded-md border-border/50 focus:border-brand-primary/50 text-sm"
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}
