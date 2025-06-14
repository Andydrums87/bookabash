"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(
  ({ className, ...props }, ref) => (
    React.createElement(CheckboxPrimitive.Root, {
      ref: ref,
      className: cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-orange-500 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white",
        className
      ),
      ...props,
    },
    React.createElement(CheckboxPrimitive.Indicator, { className: cn("flex items-center justify-center text-current") },
      React.createElement(Check, { className: "h-4 w-4" })
    ))
  )
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };