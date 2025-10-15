interface NewProperty {
  property_id?: string;
  owner_id: string;
  title: string;
  price_per_night: number;
  description?: string;
  city?: string;
  country?: string;
  // images?: string[]; 
  guests?: number;
}

interface Property extends NewProperty {
  property_id: string;
}

type PropertyListQuery = {
  limit?: number;
  offset?: number;
};
