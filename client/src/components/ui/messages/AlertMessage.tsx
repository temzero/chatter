// src/components/ui/Message.tsx
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

type AlertMessageProps = {
  className?: string;
};

export const AlertMessage = ({ className = "" }: AlertMessageProps) => {
  const message = useAuthStore((state) => state.message);

  useEffect(() => {
    useAuthStore.setState({ message: null });
  }, []);

  if (!message) return null;

  const getMessageColor = () => {
    switch (message.type) {
      case "error":
        return "text-red-400";
      case "success":
        return "text-green-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className={`${getMessageColor()} ${className} select-all`}>{message.content}</div>
  );
};
