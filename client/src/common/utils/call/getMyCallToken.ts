import { getMyChatMember } from "@/stores/chatMemberStore";
import { callService } from "@/services/callService";

export async function getMyCallToken(chatId: string): Promise<string | undefined> {
  try {
    const myChatMember = await getMyChatMember(chatId);
    if (!myChatMember?.id) {
      console.warn("[getMyCallToken] No chat member found, returning undefined");
      return undefined;
    }

    const participantName =
      myChatMember.nickname ||
      [myChatMember.firstName, myChatMember.lastName].filter(Boolean).join(" ");

    const token = await callService.generateAndFetchLiveKitToken({
      chatId,
      participantName,
      avatarUrl: myChatMember.avatarUrl || null,
    });

    return token;
  } catch (err) {
    console.error("[getMyCallToken] error:", err);
    return undefined;
  }
}
