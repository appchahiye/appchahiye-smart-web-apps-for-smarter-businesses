import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "shadow-soft hover:shadow-soft-lg",
        elevated: "shadow-soft-md hover:shadow-soft-xl hover:-translate-y-1",
        interactive: "shadow-soft hover:shadow-soft-xl hover:-translate-y-1 hover:border-primary/20 cursor-pointer",
        glass: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-glass",
        "glass-subtle": "bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-white/10 dark:border-white/5",
        glow: "shadow-soft hover:shadow-glow-primary hover:border-primary/30",
        gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-gray-200/50 dark:border-gray-800/50",
        outline: "border-2 shadow-none hover:border-primary/50 hover:shadow-soft",
        flat: "border-0 shadow-none bg-muted/50",
      },
      padding: {
        default: "",
        none: "[&>div]:p-0",
        sm: "[&>div]:p-4",
        lg: "[&>div]:p-8",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> { }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight text-lg", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
