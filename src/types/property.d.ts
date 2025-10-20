interface NewProperty {
  property_id?: string; 
  title: string;
  description?: string;
  city?: string;
  country?: string;
  price_per_night: number;
  availability?: boolean;
}

interface Property extends NewProperty {
  property_id: string;
}

type PropertyListQuery = {
  limit?: number;
  offset?: number;
};
