import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import SidebarFilters from "@/components/SidebarFilters";
import type { OfferFacets } from "@/domain/offerFacets";

interface MobileOfferFiltersProps {
  bankFilter: string[];
  onBankFilterChange: (banks: string[]) => void;
  platformFilter: string[];
  onPlatformFilterChange: (platforms: string[]) => void;
  paymentFilter: string[];
  onPaymentFilterChange: (types: string[]) => void;
  channelFilter: string[];
  onChannelFilterChange: (channels: string[]) => void;
  facets?: OfferFacets;
  onResetAll: () => void;
}

const MobileOfferFilters = (props: MobileOfferFiltersProps) => {
  const activeCount =
    props.bankFilter.length +
    props.platformFilter.length +
    props.paymentFilter.length +
    props.channelFilter.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl lg:hidden">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] sm:w-[380px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <SidebarFilters {...props} />
        </div>
        <SheetFooter className="mt-4">
          <Button variant="outline" onClick={props.onResetAll} className="w-full">
            Reset all
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MobileOfferFilters;
