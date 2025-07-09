import { useState, useEffect } from 'react';
import { Music, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MusicWidgetProps {
  active: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function MusicWidget({ active, collapsed, onToggleCollapse }: MusicWidgetProps) {
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [embedSrc, setEmbedSrc] = useState('');

  // Charger depuis localStorage ou playlist par défaut
  useEffect(() => {
    const stored = localStorage.getItem('spotifyEmbedSrc');
    if (stored) {
      setEmbedSrc(stored);
    } else {
      setEmbedSrc('https://open.spotify.com/embed/playlist/37i9dQZF1DWZa8CSUr0hCY?utm_source=generator&theme=0');
    }
  }, []);

  const handleEmbed = () => {
    if (!spotifyUrl.trim()) return;
    try {
      const url = new URL(spotifyUrl);
      const pathname = url.pathname; // /track/ID or /playlist/ID ...
      const embedPath = pathname.replace(/^\//, '/embed/');
      const src = `https://open.spotify.com${embedPath}?utm_source=oembed&theme=0`;
      setEmbedSrc(src);
      localStorage.setItem('spotifyEmbedSrc', src);
      setSpotifyUrl('');
      // onClose(); // This prop is removed, so this line is removed.
    } catch (error) {
      alert('URL Spotify invalide');
    }
  };

  const toggleCollapsed = onToggleCollapse;

  if (!active) return null;

  return (
    <>
      {/* aucune barre externe désormais */}

      {/* Embed permanent en bas à droite */}
      {
        <div className="fixed bottom-4 right-4 z-[9998] w-80 sm:w-96">
          {/* Collapsible container */}
          <div
            className="transition-transform duration-300 origin-bottom bg-[#121212]/90 backdrop-blur-md rounded-lg shadow-xl overflow-hidden"
            style={{transform: collapsed ? 'translateY(370px)' : 'translateY(0)'}}
          >
            <div className="bg-[#121212]/90 p-3 flex items-center space-x-2 text-white">
              <Music className="w-4 h-4 flex-shrink-0 text-[#1DB954]" />
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="URL Spotify (track/playlist)"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  onKeyDown={(e)=> e.key==='Enter' && handleEmbed()}
                  className="pr-8 text-xs bg-white text-gray-900"
                />
                <button
                  onClick={handleEmbed}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#1DB954] hover:text-[#17c45c]"
                  title="Valider le lien"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={toggleCollapsed}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white flex-shrink-0"
                title="Ranger"
              >
                ▾
              </button>
            </div>
            <iframe
              style={{ borderRadius: '0 0 12px 12px' }}
              src={embedSrc}
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
          {/* plus de bulle */}
        </div>
      }
    </>
  );
} 