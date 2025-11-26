import { InviteLink } from 'src/modules/invite-link/entities/invite-link.entity';

export function generateInviteLink(link?: InviteLink): string | null {
  if (!link || !link.token) return null;
  const baseUrl = process.env.CLIENT_URL;
  if (!baseUrl) {
    throw new Error('CLIENT_URL is not defined in environment variables');
  }
  return `${baseUrl}/invite/${link.token}`;
}

export function getActiveInviteLinks(links?: InviteLink[]): string[] {
  if (!Array.isArray(links)) return [];

  // Sort by createdAt (oldest first)
  const sortedLinks = links
    .slice()
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  return sortedLinks
    .map((link) => generateInviteLink(link))
    .filter((url): url is string => url !== null); // Remove nulls safely
}
