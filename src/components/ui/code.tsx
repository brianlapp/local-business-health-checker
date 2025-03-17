
import * as React from "react"
 
import { cn } from "@/lib/utils"
 
const Code = React.forwardRef<
  HTMLPreElement,
  React.HTMLAttributes<HTMLPreElement>
>(({ className, ...props }, ref) => (
  <pre
    ref={ref}
    className={cn(
      "rounded-lg border bg-muted px-4 py-3 font-mono text-sm text-muted-foreground",
      className
    )}
    {...props}
  />
))
Code.displayName = "Code"
 
export { Code }
