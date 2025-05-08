export interface ChatPartnerDto {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string | null;
  bio?: string | null;
  phone_number?: string | null;
  birthday?: Date | null;
  status?: string | null;
  last_seen?: Date | null;
}
