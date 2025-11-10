import React from "react";
import { motion } from "framer-motion";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import {
  getCallStatusColor,
  getCallStatusIcon,
} from "@/common/utils/call/callHelpers";
import { callAnimations } from "@/common/animations/callAnimations";

interface CallIconProps {
  status: CallStatus;
  isBroadcast?: boolean; // optional for broadcast calls
  className?: string;
}

const CallIcon: React.FC<CallIconProps> = ({
  status,
  isBroadcast = false,
  className = "",
}) => {
  const icon = getCallStatusIcon(status, isBroadcast);
  const iconColor = getCallStatusColor(status);
  const motionProps = callAnimations.callIcon(status);

  return (
    <motion.span
      className={`material-symbols-outlined filled select-none ${iconColor} ${className}`}
      {...motionProps}
    >
      {icon}
    </motion.span>
  );
};

export default CallIcon;
