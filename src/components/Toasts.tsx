import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useStore } from "../lib/store";

export default function Toasts() {
  const { toasts } = useStore();

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-2"
      aria-live="polite"
      role="status"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast pointer-events-auto flex items-start gap-2.5 rounded-xl border border-black/5 bg-white/95 px-4 py-3 shadow-xl shadow-black/10 backdrop-blur"
        >
          {t.type === "success" && (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
          )}
          {t.type === "error" && (
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" aria-hidden="true" />
          )}
          {t.type === "info" && (
            <Info size={18} className="mt-0.5 shrink-0 text-sky-500" aria-hidden="true" />
          )}
          <p className="text-sm font-medium leading-snug">{t.message}</p>
        </div>
      ))}
    </div>
  );
}
