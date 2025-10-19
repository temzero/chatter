export function scrollToMessageById(
  messageId: string,
  options: {
    animate?: boolean;
    smooth?: boolean;
  } = {}
) {
  const { animate = true, smooth = true } = options;
  const messageElement = document.getElementById(`message-${messageId}`);

  if (messageElement) {
    messageElement.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "center",
    });

    if (animate) {
      // Add temporary highlight class
      messageElement.classList.add("highlight-message");

      setTimeout(() => {
        messageElement.classList.remove("highlight-message");
      }, 2000);
    }
  }
}
