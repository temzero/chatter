import React, { useState, useEffect } from "react";

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
  className = "",
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (copied) {
      timer = setTimeout(() => setCopied(null), 500);
    }
    return () => clearTimeout(timer);
  }, [copied]);

  if (!value) return null;

  // Format birthday if copyType === "birthday"
  const formattedValue =
    copyType === "birthday" && !isNaN(Date.parse(value))
      ? new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : value;

  const handleCopy = () => {
    if (!formattedValue) return;
    navigator.clipboard.writeText(formattedValue);
    setCopied(copyType);
  };

  return (
    <div
      className={`flex cursor-pointer p-2 opacity-80 hover:bg-[var(--hover-color)] w-full justify-between ${className}`}
      onClick={handleCopy}
    >
      <i className="material-symbols-outlined">{icon}</i>
      {copied === copyType ? (
        <span className="text-green-400">
          {copyType.charAt(0).toUpperCase() + copyType.slice(1)} copied!
        </span>
      ) : (
        formattedValue || defaultText
      )}
    </div>
  );
};

export default ContactInfoItem;
