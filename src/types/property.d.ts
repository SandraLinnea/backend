interface NewProperty {
  property_id?: string;
  owner_id: string;
  title: string;
  price_per_night: number;
  description?: string;
  city?: string;
  country?: string;
  // images?: string[];          // URL:er
  guests?: number;
}

interface Property extends NewProperty {
  property_id: string;
}

type PropertyListQuery = {
  limit?: number;
  offset?: number;
  city?: string;
  q?: string;
  sort_by?: "title" | "price_per_night" | string;
};
