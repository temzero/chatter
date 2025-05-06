import { create } from "zustand";

type UIState = {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  currentView: 'chats' | 'contacts' | 'settings';
  modal: {
    type: string | null;
    props: any;
  };
};

type UIActions = {
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setCurrentView: (view: UIState['currentView']) => void;
  openModal: (type: string, props?: any) => void;
  closeModal: () => void;
};

export const useUIStore = create<UIState & UIActions>()(
  (set) => ({
    theme: 'light',
    sidebarOpen: true,
    currentView: 'chats',
    modal: {
      type: null,
      props: null,
    },
    
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setCurrentView: (view) => set({ currentView: view }),
    openModal: (type, props = {}) => set({ modal: { type, props } }),
    closeModal: () => set({ modal: { type: null, props: null } }),
  })
);