export function scrollToMessageById(messageId: string) {
  const messageElement = document.getElementById(`message-${messageId}`);
  if (messageElement) {
    messageElement.scrollIntoView({
      block: "center",
    });

    // Add temporary highlight class
    messageElement.classList.add("highlight-message");
    setTimeout(() => {
      messageElement.classList.remove("highlight-message");
    }, 2000);
  }
}
