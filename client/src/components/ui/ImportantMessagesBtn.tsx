import React from "react";
import SwitchBtn from "./SwitchBtn";
import { useMessageStore } from "@/stores/messageStore";

const ImportantMessagesBtn: React.FC = () => {
  const showImportantOnly = useMessageStore((state) => state.showImportantOnly);
  const setShowImportantOnly = useMessageStore(
    (state) => state.setShowImportantOnly
  );

  const handleToggle = (value: boolean) => {
    setShowImportantOnly(value);
  };

  return (
    <div className="flex items-center justify-between gap-2 p-2 w-full custom-border rounded">
      <div className="flex items-center gap-1">
        <span className="material-symbols-outlined text-red-500 font-bold">
          label_important
        </span>
        <h1>Important Messages</h1>
      </div>

      <SwitchBtn checked={showImportantOnly} onCheckedChange={handleToggle} />
    </div>
  );
};

export default ImportantMessagesBtn;
