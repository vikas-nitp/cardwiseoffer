import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onReset: () => void;
  message?: string;
}

const EmptyState = ({ onReset, message }: EmptyStateProps) => (
  <div className="bg-card rounded-2xl card-shadow border border-border/40 p-12 text-center">
    <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
      <SearchX className="w-5 h-5 text-muted-foreground" />
    </div>
    <h3 className="text-base font-bold text-foreground mb-2 tracking-tight">
      {message ?? "No offers match your filters"}
    </h3>
    <p className="text-[13px] text-muted-foreground mb-6 max-w-sm mx-auto">
      Try adjusting your selection to see more results.
    </p>
    <Button onClick={onReset} variant="outline" className="rounded-xl font-medium text-[13px] gap-2">Reset</Button>
  </div>
);

export default EmptyState;
