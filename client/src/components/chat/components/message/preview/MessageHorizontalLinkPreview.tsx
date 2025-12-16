import React from "react";
import clsx from "clsx";
import { LinkPreviewResponse } from "@/shared/types/responses/message.response";

interface MessageHorizontalLinkPreviewProps {
  linkPreview?: LinkPreviewResponse | null;
}

export const MessageHorizontalLinkPreview: React.FC<
  MessageHorizontalLinkPreviewProps
> = ({ linkPreview }) => {
  if (!linkPreview) return null;

  const imageUrl = linkPreview.image || linkPreview.favicon;
  const title = linkPreview.title;

  return (
    <div className="flex items-center bg-blue-600 text-white custom-border rounded max-w-[50%]">
      <span className="material-symbols-outlined text-sm text-white rotate-90">
        link
      </span>

      <img
        src={imageUrl}
        className={clsx(
          "h-8 object-cover custom-border rounded mr-1",
          "transition-transform duration-300",
          "group-hover:scale-200"
        )}
      />

      {title ? (
        <h1 className="font-semibold truncate line-clamp-1">{title}</h1>
      ) : (
        <h1 className="truncate text-xs italic line-clamp-1">
          {linkPreview.url}
        </h1>
      )}
    </div>
  );
};
