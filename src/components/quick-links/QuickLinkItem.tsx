interface QuickLinkItemProps {
  icon: string;
  name: string;
  url: string;
}

export function QuickLinkItem({ icon, name, url }: QuickLinkItemProps) {
  return (
    <a
      href={url}
      className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-white/10 transition-colors group"
    >
      <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-xs text-gray-600 text-center">{name}</span>
    </a>
  );
}