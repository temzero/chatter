export interface ChatPartnerDto {
  id: string;
  username: string;
  nickname?: string | null;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  avatar?: string | null;
  bio?: string | null;
  phone_number?: string | null;
  birthday?: Date | null;
  status?: string | null;
  last_seen?: Date | null;
}
