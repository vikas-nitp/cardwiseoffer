import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LockedOfferCardProps {
  onLoginClick: () => void;
}

const LockedOfferCard = ({ onLoginClick }: LockedOfferCardProps) => {
  return (
    <div className="glass-card rounded-2xl card-shadow flex flex-col h-full border-t-4 border-border relative overflow-hidden">
      {/* Blurred placeholder content */}
      <div className="px-5 pt-5 pb-3 blur-sm select-none pointer-events-none">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
          Card Offer
        </span>
      </div>
      <div className="px-5 pb-4 blur-sm select-none pointer-events-none">
        <p className="text-3xl font-display font-bold text-foreground tracking-tight">₹X,XXX</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-bold bg-secondary px-2.5 py-1 rounded-full text-secondary-foreground">Bank Name</span>
        </div>
      </div>
      <div className="px-5 pb-4 flex-1 blur-sm select-none pointer-events-none">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-1.5" />
            Conditions apply
          </div>
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 p-5">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground text-center">Login to see this offer</p>
        <Button
          size="sm"
          className="rounded-xl font-semibold gap-1.5"
          onClick={onLoginClick}
        >
          <User className="w-3.5 h-3.5" />
          Login Now
        </Button>
      </div>
    </div>
  );
};

export default LockedOfferCard;
