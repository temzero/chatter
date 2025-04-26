import React, { useState, useEffect } from 'react';

interface FormatTimeProps {
  time: string;
}

const FormatTime: React.FC<FormatTimeProps> = ({ time }) => {
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    const date = new Date(time);
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true, // To display in 12-hour format with AM/PM (optional)
    };
    setFormattedTime(date.toLocaleTimeString(undefined, options));
  }, [time]);

  return <span>{formattedTime}</span>;
};

export default FormatTime;