type PayoutMethod = "bank_transfer" | "paypal";

interface NewOwner {
  owner_id?: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  is_company?: boolean;      // företag vs privatperson

}

interface Owner extends NewOwner {
  owner_id: string;
  password_hash: string;
  created_at: string;
  updated_at?: string;
}

/* 
export interface OwnerListQuery {
  q?: string;
  sort_by?: string;
  offset?: number;
  limit?: number;
}
*/
