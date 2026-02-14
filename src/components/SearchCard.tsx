import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar as CalendarIcon, CreditCard, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const banks = [
  "HDFC Bank",
  "ICICI Bank",
  "SBI Card",
  "Axis Bank",
  "Kotak Mahindra",
  "American Express",
  "Yes Bank",
  "IndusInd Bank",
  "RBL Bank",
  "HSBC",
];

const cities = [
  { city: "Bangalore", code: "BLR", airport: "Kempegowda International Airport" },
  { city: "Delhi", code: "DEL", airport: "Indira Gandhi International Airport" },
  { city: "Mumbai", code: "BOM", airport: "Chhatrapati Shivaji Maharaj International Airport" },
  { city: "Chennai", code: "MAA", airport: "Chennai International Airport" },
  { city: "Hyderabad", code: "HYD", airport: "Rajiv Gandhi International Airport" },
  { city: "Kolkata", code: "CCU", airport: "Netaji Subhas Chandra Bose International Airport" },
  { city: "Pune", code: "PNQ", airport: "Pune Airport" },
  { city: "Goa", code: "GOI", airport: "Manohar International Airport" },
  { city: "Jaipur", code: "JAI", airport: "Jaipur International Airport" },
  { city: "Ahmedabad", code: "AMD", airport: "Sardar Vallabhbhai Patel International Airport" },
];

const tileClasses = "bg-secondary/50 border-0 h-auto text-sm pl-10 relative py-2.5 min-h-[56px]";

const SearchCard = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState("BLR");
  const [to, setTo] = useState("DEL");
  const [date, setDate] = useState<Date>(new Date("2025-04-24"));
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);

  const toggleBank = (bank: string) => {
    setSelectedBanks((prev) => {
      if (prev.includes(bank)) {
        return prev.filter((b) => b !== bank);
      }
      if (prev.length >= 2) return prev; // max 2
      return [...prev, bank];
    });
  };

  const handleSearch = () => {
    const fromCity = cities.find(c => c.code === from);
    const toCity = cities.find(c => c.code === to);
    navigate("/results", {
      state: {
        from: fromCity ? `${fromCity.city} (${fromCity.code})` : "Bangalore",
        to: toCity ? `${toCity.city} (${toCity.code})` : "Delhi",
        date: format(date, "yyyy-MM-dd"),
        bank: selectedBanks.length > 0 ? selectedBanks.join(", ") : "HDFC Bank",
      },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-card/95 backdrop-blur-sm rounded-2xl card-shadow-lg p-6 md:p-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* From */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">From</label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className={tileClasses}>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <div className="text-left truncate">
                <span className="font-bold text-foreground block">{cities.find(c => c.code === from)?.city}</span>
                <span className="text-xs text-muted-foreground truncate block">{from} · {cities.find(c => c.code === from)?.airport}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {cities.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="font-semibold">{c.city}</span> <span className="text-muted-foreground">({c.code})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* To */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">To</label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className={tileClasses}>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <div className="text-left truncate">
                <span className="font-bold text-foreground block">{cities.find(c => c.code === to)?.city}</span>
                <span className="text-xs text-muted-foreground truncate block">{to} · {cities.find(c => c.code === to)?.airport}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {cities.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="font-semibold">{c.city}</span> <span className="text-muted-foreground">({c.code})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Departure */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Departure</label>
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn(tileClasses, "w-full rounded-md text-left flex items-center")}>
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="font-bold text-foreground block">{format(date, "dd MMM yyyy")}</span>
                  <span className="text-xs text-muted-foreground">{format(date, "EEEE")}</span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Bank Multi-Select */}
      <div className="mt-4 space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5" />
          Select Banks
          <span className="text-muted-foreground/50 font-normal normal-case">(up to 2, optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {banks.map((b) => {
            const isSelected = selectedBanks.includes(b);
            const isDisabled = !isSelected && selectedBanks.length >= 2;
            return (
              <button
                key={b}
                onClick={() => toggleBank(b)}
                disabled={isDisabled}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/50 text-foreground border-border hover:border-primary/50",
                  isDisabled && "opacity-40 cursor-not-allowed"
                )}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={handleSearch}
        className="w-full mt-6 h-12 text-base font-semibold rounded-xl gap-2"
        size="lg"
      >
        <Search className="w-4 h-4" />
        Search Best Offer
      </Button>
    </div>
  );
};

export default SearchCard;
