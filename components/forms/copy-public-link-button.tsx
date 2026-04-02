"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyPublicLinkButton({
  url,
  idleLabel,
  copiedLabel,
  disabled,
  variant = "outline",
  size = "sm",
  className,
}: {
  url: string;
  idleLabel: string;
  copiedLabel: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (!url || disabled) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={() => void onCopy()}
      disabled={disabled || !url}
    >
      {copied ? copiedLabel : idleLabel}
    </Button>
  );
}
