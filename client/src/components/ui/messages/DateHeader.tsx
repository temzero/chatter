import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatGroupDate } from '@/common/utils/format/formatGroupDate';

interface DateHeaderProps {
  date: string;
}

const DateHeader: React.FC<DateHeaderProps> = ({ date }) => {
  const { t } = useTranslation();
  
  return (
    <div className="sticky top-0 flex justify-center z-1">
      <div className="glass-panel text-xs px-2 py-1 rounded-full">
        {formatGroupDate(date, t)}
      </div>
    </div>
  );
};

export default React.memo(DateHeader);