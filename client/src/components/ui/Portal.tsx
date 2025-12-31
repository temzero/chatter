import React, { useLayoutEffect, useState } from "react";
import ReactDOM from "react-dom";

interface PortalProps {
  children: React.ReactNode;
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
  // ✅ Create once during initial render
  const [container] = useState(() => document.createElement("div"));

  // ✅ Sync with external system (DOM)
  useLayoutEffect(() => {
    document.body.appendChild(container);

    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  return ReactDOM.createPortal(children, container);
};
