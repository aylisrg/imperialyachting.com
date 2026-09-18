export type BookingStatus =
  | "quote"
  | "hold"
  | "deposit_paid"
  | "paid"
  | "cancelled"
  | "expired";

export type BookingSource = "mcp" | "web" | "admin";

export type ExtraUnit = "per_booking" | "per_hour" | "per_guest";

export interface Extra {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  unit: ExtraUnit;
  category: string;
  image: string;
  active: boolean;
  sortOrder: number;
}

export interface Booking {
  id: string;
  yachtId: string;
  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  hours: number;
  guests: number;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  source: BookingSource;
  baseAmount: number;
  extrasAmount: number;
  bonusHours: number;
  totalAmount: number;
  depositAmount: number;
  currency: string;
  quoteExpiresAt: string | null;
  holdExpiresAt: string | null;
  stripeCheckoutId: string | null;
  stripePaymentIntentId: string | null;
  gcalEventId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingExtra {
  id: string;
  bookingId: string;
  extraId: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  preferredDate: string | null;
  message: string;
  source: string;
  createdAt: string;
}
