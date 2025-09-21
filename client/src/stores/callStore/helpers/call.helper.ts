import { getMyChatMember } from "../../chatMemberStore";
import { callService } from "@/services/callService";

export async function getMyToken(chatId: string): Promise<string | undefined> {
  try {
    const myChatMember = await getMyChatMember(chatId);
    if (!myChatMember?.id) {
      console.warn("[getMyToken] No chat member found, returning undefined");
      return undefined;
    }

    const participantName =
      myChatMember.nickname ||
      [myChatMember.firstName, myChatMember.lastName].filter(Boolean).join(" ");

    const token = await callService.generateAndFetchLiveKitToken(
      chatId,
      participantName,
      myChatMember.avatarUrl || undefined
    );

    return token;
  } catch (err) {
    console.error("[getMyToken] error:", err);
    return undefined;
  }
}
