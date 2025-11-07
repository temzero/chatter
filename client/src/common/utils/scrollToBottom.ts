// utils/scroll.ts
export const scrollToBottom = (
  el: HTMLElement | null,
  behavior: ScrollBehavior = "auto",
  offset: number = 0
) => {
  if (!el) return;
  el.scrollTo({
    top: el.scrollHeight - offset,
    behavior,
  });
};
