export interface FacetOption {
  id: string;
  name: string;
  count: number;
  selected: boolean;
  disabled: boolean;
}

export interface OfferFacets {
  platforms: FacetOption[];
  banks: FacetOption[];
  paymentMethods: FacetOption[];
  bookingChannels: FacetOption[];
}
