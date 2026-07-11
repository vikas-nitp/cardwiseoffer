import { Info } from "lucide-react";
import { IS_MOCK_MODE } from "@/config/dataMode";

const DemoModeBanner = () => {
  if (!IS_MOCK_MODE) return null;
  return (
    <div
      role="note"
      aria-label="Demo mode notice"
      className="w-full bg-amber-50/80 border-b border-amber-200/60 text-amber-900"
    >
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 text-[12px] leading-snug">
        <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold">Demo mode</strong> — Offers shown are sample data
          and may not currently be available on the linked platforms.
        </span>
      </div>
    </div>
  );
};

export default DemoModeBanner;
