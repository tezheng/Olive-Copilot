import React from "react";
import { cn } from "@/shared/lib/utils";

import { Card } from "@/components/ui/card";
import "./node.css";

export const CardNode = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      className,
      selected ? "border-muted-foreground shadow-lg" : "",
      "hover:ring-1",
      "text-left"
    )}
    tabIndex={0}
    {...props}
  />
));
CardNode.displayName = "CardNode";
