import * as React from "react";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("relative flex size-9 shrink-0 overflow-hidden rounded-full bg-primary-soft", className)}
      {...props}
    />
  ),
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, alt = "", ...props }, ref) => (
    // The source is runtime Google profile data; Next Image cannot know its dimensions here.
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} alt={alt} className={cn("relative z-10 aspect-square size-full object-cover", className)} {...props} />
  ),
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("absolute inset-0 flex size-full items-center justify-center rounded-full bg-primary-soft text-xs font-semibold uppercase text-primary", className)}
      {...props}
    />
  ),
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
