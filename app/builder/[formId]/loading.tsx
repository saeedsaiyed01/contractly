import { Loader2 } from "lucide-react";

import { AppDarkSurface } from "@/components/shell/app-dark-surface";

export default function BuilderLoading() {
  return (
    <AppDarkSurface>
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4"
        role="status"
        aria-live="polite"
        aria-label="Loading form editor"
      >
        <Loader2
          className="size-10 animate-spin text-violet-400"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="font-sans text-sm text-zinc-500">Loading editor…</p>
      </div>
    </AppDarkSurface>
  );
}
