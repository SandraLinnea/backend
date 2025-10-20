interface NewUser {
  user_id?: string;
  name: string;
  email: string;
  password: string;
  is_admin?: boolean;
}

interface User extends NewUser {
  user_id: string;
  password_hash: string;
  created_at: string;
}

type UserListQuery = {
  limit?: number;
  offset?: number;
};
