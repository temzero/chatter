import React from "react";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { getCallColor } from "@/utils/callHelpers";

interface CallIconProps {
  status: CallStatus;
  isCaller: boolean;
  className?: string; // optional extra classes
}

const CallIcon: React.FC<CallIconProps> = ({
  status,
  isCaller,
  className = "",
}) => {
  let icon = "call";
  let iconClasses = getCallColor(status);

  switch (status) {
    case CallStatus.DIALING:
      icon = "ring_volume";
      break;
    case CallStatus.IN_PROGRESS:
      icon = "phone_in_talk";
      break;
    case CallStatus.COMPLETED:
      icon = isCaller ? "phone_forwarded" : "phone_callback";
      break;
    case CallStatus.MISSED:
      icon = "phone_missed";
      if (isCaller) iconClasses += " scale-x-[-1]";
      break;
    case CallStatus.FAILED:
      icon = "e911_avatar";
      break;
  }

  return (
    <span
      className={`material-symbols-outlined select-none ${iconClasses} ${className}`}
    >
      {icon}
    </span>
  );
};

export default CallIcon;
