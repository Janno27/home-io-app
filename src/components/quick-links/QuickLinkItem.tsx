import React from 'react';
import { X, Link as LinkIcon } from "lucide-react";
import { Button } from "../ui/button";
import type { QuickLink } from '@/hooks/useQuickLinks';
import { cn } from '@/lib/utils';

interface QuickLinkItemProps {
  id: string;
  link: QuickLink;
  onDelete: () => void;
}

export function QuickLinkItem({ link, onDelete }: QuickLinkItemProps) {
  const handleClick = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling to the link
    onDelete();
  };

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        className="w-16 h-16 p-0 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-200 group-hover:scale-105"
        onClick={handleClick}
        title={link.name}
      >
        {link.icon_url ? (
          <img src={link.icon_url} alt={link.name} className="w-8 h-8 rounded-full" />
        ) : (
          <LinkIcon className="w-8 h-8 text-gray-400" />
        )}
      </Button>

      <Button
        variant="destructive"
        size="icon"
        className={cn(
          "absolute -top-1 -right-1 w-5 h-5 rounded-full z-10",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
        onClick={handleDelete}
        title="Supprimer"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}