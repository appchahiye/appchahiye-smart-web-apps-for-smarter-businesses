import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-lg text-base transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default:
          "border border-input bg-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
        filled:
          "border-0 bg-muted/50 focus:bg-muted focus:ring-2 focus:ring-primary/20 focus:outline-none",
        ghost:
          "border-0 bg-transparent focus:bg-muted/50 focus:ring-2 focus:ring-primary/20 focus:outline-none",
        premium:
          "border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none",
        glow:
          "border border-input bg-background shadow-sm focus:border-primary focus:shadow-glow-primary focus:outline-none",
      },
      inputSize: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1 text-xs",
        lg: "h-12 px-5 py-3 text-base",
        xl: "h-14 px-6 py-4 text-lg rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  VariantProps<typeof inputVariants> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
