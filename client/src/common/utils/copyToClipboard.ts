export async function copyToClipboard(
  text: string | undefined
): Promise<boolean> {
  if (!text?.trim()) {
    console.info("Nothing to copy: text is empty or whitespace only");
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard", err);
    return false;
  }
}
