import { getMyChatMember } from "../../chatMemberStore";
import { callService } from "@/services/callService";

export async function getMyToken(chatId: string): Promise<string | undefined> {
  const myChatMember = await getMyChatMember(chatId);
  if (!myChatMember?.id) return undefined;

  const participantName =
    myChatMember.nickname ||
    [myChatMember.firstName, myChatMember.lastName].filter(Boolean).join(" ");

  return callService.fetchLiveKitToken(
    chatId,
    participantName,
    myChatMember.avatarUrl || undefined
  );
}
