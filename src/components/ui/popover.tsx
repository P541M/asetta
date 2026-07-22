import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

/**
 * Asetta popover (Radix). Customized from shadcn/ui: borderless popover
 * surface with shadow-lg (surface language), no entrance animation (the
 * overlay rule: surfaces appear instantly; a scaling entrance on a panel
 * this size reads as the whole surface shifting). Content renders WITHOUT a
 * portal on purpose: popovers here live inside editors that submit on blur
 * via a container `relatedTarget` check, and a portaled popover would count
 * as "outside".
 */
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "start", sideOffset = 6, collisionPadding = 8, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    collisionPadding={collisionPadding}
    className={cn(
      "z-50 w-64 rounded-lg bg-popover p-3 text-popover-foreground shadow-lg outline-hidden",
      className,
    )}
    {...props}
  />
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
