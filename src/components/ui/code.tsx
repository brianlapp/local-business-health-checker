
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  showCopyButton?: boolean;
}

const Code = React.forwardRef<HTMLPreElement, CodeProps>(
  ({ className, showCopyButton = true, children, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);
    const textContent = typeof children === 'string' ? 
      children : 
      React.Children.toArray(children).map(child => 
        typeof child === 'string' ? child : ''
      ).join('');

    const copyToClipboard = () => {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="relative group">
        <pre
          ref={ref}
          className={cn(
            "rounded-lg border bg-muted px-4 py-3 font-mono text-sm text-muted-foreground",
            className
          )}
          {...props}
        >
          {children}
        </pre>
        {showCopyButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={copyToClipboard}
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    );
  }
);

Code.displayName = "Code";

export { Code };
