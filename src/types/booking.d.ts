export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface NewBooking {
  booking_id?: string;
  property_id: string;
  user_id: string;
  start_date: string;
  end_date: string;

  guests?: number;
  note?: string;
  status?: BookingStatus;
}

export interface Booking extends NewBooking {
  booking_id: string;
  total_price: number;
}

export type BookingListQuery = {
  limit?: number;
  offset?: number;
  property_id?: string;
  user_id?: string;
  status?: BookingStatus;
  q?: string;
  sort_by?: "start_date" | "end_date" | "total_price" | string;
};
