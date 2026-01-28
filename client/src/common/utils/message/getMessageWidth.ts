export const getMessageWidth = (
  isMobile: boolean,
  hasLinkPreview: boolean,
  attachmentLength: number
): string => {
  if (isMobile) {
    return hasLinkPreview
      ? "w-[80%]"
      : attachmentLength === 1
        ? "w-[60%]"
        : "w-[80%]";
  }
  return hasLinkPreview
    ? "w-[60%]"
    : attachmentLength === 1
      ? "w-[40%]"
      : "w-[60%]";
};

export const getChannelMessageWidth = (
  isReplyToThisMessage: boolean,
  isMobile: boolean
): string => {
  let classes = "";
  
  if (isReplyToThisMessage) {
    classes += "scale-[1.1] ";
  }
  
  classes += isMobile ? "w-[90%]" : "w-[64%]";
  
  return classes.trim();
};