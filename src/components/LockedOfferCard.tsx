import { Lock } from "lucide-react";

const LockedOfferCard = () => {
  return (
    <div className="glass-card rounded-2xl card-shadow flex flex-col h-full border-t-4 border-border relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[3px] z-10" />
      <div className="px-5 pt-5 pb-3 opacity-30">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
          <Lock className="w-3.5 h-3.5" />
          Locked Offer
        </span>
      </div>
      <div className="px-5 pb-4 opacity-30">
        <p className="text-3xl font-display font-bold text-muted-foreground">₹••••</p>
        <div className="mt-2">
          <span className="text-xs font-bold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">••••••••</span>
        </div>
      </div>
      <div className="px-5 pb-4 flex-1 opacity-20">
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-3 bg-muted rounded-full w-3/4" />
          ))}
        </div>
      </div>
      <div className="px-5 pb-5 opacity-30">
        <div className="h-11 bg-muted rounded-xl w-full" />
      </div>
    </div>
  );
};

export default LockedOfferCard;
