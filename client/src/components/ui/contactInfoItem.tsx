import React from 'react';
import { useState, useEffect } from 'react';

type ContactInfoItemProps = {
  icon: string;
  value: string | null | undefined;
  copyType: string;
  defaultText?: string;
  className?: string;
};

const ContactInfoItem: React.FC<ContactInfoItemProps> = ({
  icon,
  value,
  copyType,
  defaultText = "Not specified",
  className = ""
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (copied) {
      timer = setTimeout(() => setCopied(null), 500);
    }
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(copyType);
  };

  if (!value) return null;

  return (
    <div 
      className={`flex cursor-pointer p-1 px-2 hover:bg-[var(--hover-color)] w-full justify-between ${className}`}
      onClick={handleCopy}
    >
      <i className="material-symbols-outlined opacity-70">{icon}</i>
      {copied === copyType ? (
        <span className="text-green-400">
          {copyType.charAt(0).toUpperCase() + copyType.slice(1)} copied!
        </span>
      ) : (
        value || defaultText
      )}
    </div>
  );
};

export default ContactInfoItem;