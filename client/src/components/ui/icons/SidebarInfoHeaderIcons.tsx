interface HeaderIconProps {
  icons: {
    icon: string;
    title: string;
    action: () => void;
    className?: string;
  }[];
}

export const SidebarInfoHeaderIcons: React.FC<HeaderIconProps> = ({ icons }) => (
  <header className="flex w-full justify-around items-center min-h-[var(--header-height)] custom-border-b select-none">
    {icons.map(({ icon, title, action, className = "" }) => (
      <a
        key={icon}
        title={title}
        className={`flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100 ${className}`}
        onClick={action}
      >
        <i className="material-symbols-outlined">{icon}</i>
      </a>
    ))}
  </header>
);
