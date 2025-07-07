import { QuickLinkItem } from './QuickLinkItem';
import { Plus } from 'lucide-react';

export function QuickLinks() {
  const links = [
    { icon: '🌀', name: 'GitHub', url: 'https://github.com' },
    { icon: '🔧', name: 'DevTools', url: '#' },
    { icon: '📺', name: 'YouTube', url: 'https://youtube.com' },
    { icon: '🐦', name: 'Twitter', url: 'https://twitter.com' },
    { icon: '💼', name: 'LinkedIn', url: 'https://linkedin.com' },
    { icon: '📝', name: 'Notion', url: 'https://notion.so' },
    { icon: '📚', name: 'Amazon', url: 'https://amazon.com' },
    { icon: '💚', name: 'Spotify', url: 'https://spotify.com' },
  ];

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-w-2xl mx-auto">
      {links.map((link, index) => (
        <QuickLinkItem key={index} {...link} />
      ))}
      <div className="flex items-center justify-center">
        <button className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
          <Plus className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}