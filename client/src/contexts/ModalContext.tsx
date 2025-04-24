import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

// Define the context type
interface ModalContextProps {
  currentMediaId: string | null;
  openModal: (mediaId: string) => void;
  closeModal: () => void;
}

// Create the context
const ModalContext = createContext<ModalContextProps | undefined>(undefined);

// Provider component
export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMediaId, setCurrentMediaId] = useState<string | null>(null);

  const openModal = (mediaId: string) => {
    setCurrentMediaId(mediaId);
  };

  const closeModal = () => {
    setCurrentMediaId(null);
  };

  return (
    <ModalContext.Provider value={{ currentMediaId, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

// Hook to use modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
