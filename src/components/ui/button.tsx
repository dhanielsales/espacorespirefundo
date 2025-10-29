import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-violet-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        // Brand variants
        "brand-violet":
          "bg-brand-violet-700 text-white shadow hover:opacity-80",
        "brand-violet-light":
          "bg-brand-violet-500 text-white shadow hover:opacity-80",
        "brand-pink": "bg-brand-pink-700 text-white shadow hover:opacity-80",
        "brand-pink-light":
          "bg-brand-pink-500 text-white shadow hover:opacity-80",

        // Standard variants
        default: "bg-sky-600 text-white shadow hover:bg-sky-700",
        destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border border-gray-300 bg-white shadow-sm hover:bg-gray-100 hover:text-gray-900",
        secondary: "bg-gray-200 text-gray-900 shadow-sm hover:bg-gray-300",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-sky-600 underline-offset-4 hover:underline",

        // Brand outline variants
        "brand-violet-outline":
          "border border-brand-violet-500 bg-white text-brand-violet-500 shadow-sm hover:bg-brand-violet-100",
        "brand-pink-outline":
          "border border-brand-pink-500 bg-white text-brand-pink-500 shadow-sm hover:bg-brand-pink-100",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type Variants = VariantProps<typeof buttonVariants>["variant"];

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner size="sm" className="mr-2" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
