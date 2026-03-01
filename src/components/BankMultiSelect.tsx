import { useState, useRef, useEffect } from "react";
import { CreditCard, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const banks = [
  "HDFC Bank", "ICICI Bank", "SBI Card", "Axis Bank", "Kotak Mahindra",
  "American Express", "Yes Bank", "IndusInd Bank", "RBL Bank", "HSBC",
];

interface BankMultiSelectProps {
  selected: string[];
  onChange: (banks: string[]) => void;
}

const BankMultiSelect = ({ selected, onChange }: BankMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showMaxMsg, setShowMaxMsg] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        setShowMaxMsg(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = banks.filter((b) =>
    b.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBank = (bank: string) => {
    if (selected.includes(bank)) {
      onChange(selected.filter((b) => b !== bank));
      setShowMaxMsg(false);
    } else if (selected.length >= 2) {
      setShowMaxMsg(true);
    } else {
      onChange([...selected, bank]);
      setShowMaxMsg(false);
    }
  };

  return (
    <div className="space-y-1.5 relative z-10" ref={wrapperRef}>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <CreditCard className="w-3.5 h-3.5" />
        Card
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-secondary/50 border-0 h-auto text-sm pl-10 pr-3 py-2.5 min-h-[56px] rounded-xl text-left relative flex items-center hover:bg-secondary/70 transition-colors"
      >
        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        {selected.length === 0 ? (
          <span className="text-muted-foreground">Select Card(s)</span>
        ) : (
          <span className="font-bold text-foreground">{selected.join(", ")}</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-[60] mt-1 bg-card border border-border rounded-xl shadow-xl">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cards..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
          </div>
          {showMaxMsg && (
            <p className="text-xs text-destructive px-3 py-2 bg-destructive/10 border-b border-border font-medium">
              ⚠ Maximum 2 cards allowed. Deselect one to choose another.
            </p>
          )}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.map((bank) => {
              const isSelected = selected.includes(bank);
              return (
                <button
                  key={bank}
                  onClick={() => toggleBank(bank)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-secondary/60 transition-colors text-sm",
                    isSelected && "bg-primary/10"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0",
                      isSelected ? "bg-primary border-primary" : "border-border"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className={cn("text-foreground", isSelected && "font-semibold")}>
                    {bank}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">No cards found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BankMultiSelect;
