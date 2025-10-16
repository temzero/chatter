// componen@/components/ui/SwitchBtn.tsx
import React from "react";
import * as Switch from "@radix-ui/react-switch";

interface PrivacySwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const SwitchBtn: React.FC<PrivacySwitchProps> = ({
  checked,
  onCheckedChange,
}) => {
  return (
    <div className="flex-shrink-0">
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="w-11 h-6 bg-[--input-border-color] data-[state=checked]:bg-[--primary-green] rounded-full relative outline-none cursor-pointer transition-colors"
      >
        <Switch.Thumb className="block w-4 h-4 bg-white custom-border rounded-full shadow-md transition-transform -translate-x-[10px] data-[state=checked]:translate-x-[10px]" />
      </Switch.Root>
    </div>
  );
};

export default SwitchBtn;
