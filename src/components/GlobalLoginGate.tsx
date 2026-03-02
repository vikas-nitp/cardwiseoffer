import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GlobalLoginGateProps {
  onLoginClick: () => void;
  totalOffers: number;
}

const GlobalLoginGate = ({ onLoginClick, totalOffers }: GlobalLoginGateProps) => {
  return (
    <div className="glass-card rounded-2xl card-shadow-lg p-8 md:p-10 text-center max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <Lock className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-xl font-display font-bold text-foreground mb-2">
        Sign in to unlock all {totalOffers} offers
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
        Create a free account to see every card offer, compare savings, and find the best deal for your flight.
      </p>
      <Button
        size="lg"
        className="rounded-xl font-bold gap-2 px-8 h-12 text-base shadow-lg hover:shadow-xl transition-all"
        onClick={onLoginClick}
      >
        <User className="w-4 h-4" />
        Sign In to Continue
      </Button>
    </div>
  );
};

export default GlobalLoginGate;
