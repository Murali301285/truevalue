"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string | number | undefined;
    onValueChange: (val: number | undefined) => void;
    label?: string; // Optional embedded label or placeholder
}

export function CurrencyInput({ value, onValueChange, className, ...props }: CurrencyInputProps) {
    const formatIndian = (num: number) => {
        const x = num.toString();
        const lastThree = x.substring(x.length - 3);
        const otherNumbers = x.substring(0, x.length - 3);
        if (otherNumbers !== '')
            return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
        return lastThree; // For numbers < 1000
    }

    const [displayParam, setDisplayParam] = React.useState("");

    React.useEffect(() => {
        if (value === undefined || value === 0 || value === "") {
            setDisplayParam("");
        } else {
            setDisplayParam(formatIndian(Number(value)));
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/,/g, '');
        if (val === '') {
            onValueChange(undefined);
            setDisplayParam("");
            return;
        }
        if (!isNaN(Number(val))) {
            onValueChange(Number(val));
            setDisplayParam(formatIndian(Number(val)));
        }
    }

    return (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">₹</span>
            <Input
                {...props}
                value={displayParam}
                onChange={handleChange}
                className={cn("pl-7 font-mono", className)} // Mono font for numbers alignment
            />
        </div>
    )
}
