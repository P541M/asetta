import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Asetta alert. Customized from shadcn/ui: borderless tinted surfaces (the
 * platform has no decorative borders) and a `success` variant for auth flows.
 */
const alertVariants = cva(
  "relative w-full rounded-lg px-4 py-3 text-sm grid grid-cols-[auto_1fr] gap-x-3 items-start [&>svg]:size-5 [&>svg]:mt-0.5",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground [&>svg]:text-muted-foreground",
        destructive: "bg-destructive/10 text-destructive [&>svg]:text-destructive",
        success: "bg-success/10 text-success [&>svg]:text-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("col-start-2 text-sm font-medium leading-normal", className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("col-start-2 text-sm leading-normal", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
