import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, CreditCard, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SearchCard = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [bank, setBank] = useState("");

  const handleSearch = () => {
    navigate("/results", {
      state: {
        from: from || "Bangalore",
        to: to || "Delhi",
        date: date || "2025-04-24",
        bank: bank || "HDFC",
      },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-card rounded-2xl card-shadow-lg p-6 md:p-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">From</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="City or airport"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="pl-10 bg-secondary/50 border-0 h-12 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">To</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="City or airport"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="pl-10 bg-secondary/50 border-0 h-12 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Departure</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 bg-secondary/50 border-0 h-12 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Select Bank <span className="text-muted-foreground/50">(optional)</span></label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="e.g. HDFC, ICICI, SBI"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="pl-10 bg-secondary/50 border-0 h-12 text-sm"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleSearch}
        className="w-full mt-6 h-12 text-base font-semibold rounded-xl gap-2"
        size="lg"
      >
        <Search className="w-4 h-4" />
        Find Best Offer
      </Button>
    </div>
  );
};

export default SearchCard;
