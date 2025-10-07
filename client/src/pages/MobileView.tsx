import { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatBox from "@/components/chat/ChatBox";
import ChatSidebar from "@/components/chat/ChatSidebar";

import { MobileViewMode } from "@/types/enums/MobileViewMode";

const MobileView: React.FC = () => {
  const [activeView, setActiveView] = useState<MobileViewMode>(
    MobileViewMode.SIDEBAR
  );

  return (
    <div className="w-full h-full relative">
      {/* Sidebar view */}
      {activeView === MobileViewMode.SIDEBAR && (
        // <Sidebar onSelectChat={() => setActiveView(MobileViewMode.CHAT)} />
        <Sidebar />
      )}

      {/* Chat view */}
      {activeView === MobileViewMode.CHAT && (
        <div className="w-full h-full flex flex-col">
          {/* Optional back button at the top */}
          <div className="p-2">
            <button
              className="text-blue-500 font-semibold"
              onClick={() => setActiveView(MobileViewMode.SIDEBAR)}
            >
              Back
            </button>
          </div>

          {/* Chat content */}
          <div className="flex-1 flex h-full">
            <ChatBox />
            <ChatSidebar />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileView;
