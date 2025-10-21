export type BookingStatus = "pending" | "confirmed" | "cancelled";

interface NewBooking {
  property_id: string;
  user_id: string;
  start_date: string;
  end_date: string; 
  guests?: number;
  note?: string;
  status?: BookingStatus;
}

interface Booking extends NewBooking {
  id: string;
  booking_id: string;
  total_price: number;
  created_at: string;
}

type BookingListQuery = {
  limit?: number;
  offset?: number;
  property_id?: string;
  user_id?: string;
  status?: BookingStatus;
  q?: string;
  sort_by?: "start_date" | "end_date" | "total_price" | string;
};
