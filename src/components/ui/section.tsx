import { cn } from "@/lib/utils";

export function H1({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("text-2xl font-semibold tracking-tight", className)} {...props} />;
}
export function P({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-white/70 leading-relaxed", className)} {...props} />;
}
