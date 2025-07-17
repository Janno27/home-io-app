import { useState, useEffect } from 'react';
import { Music, Search, User, LogOut, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSpotify } from '@/hooks/useSpotify';

interface MusicWidgetProps {
  active: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

export function MusicWidget({ active, collapsed, onToggleCollapse, onClose }: MusicWidgetProps) {
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [embedSrc, setEmbedSrc] = useState('');
  const [showPlaylists, setShowPlaylists] = useState(false);
  
  const { isAuthenticated, user, playlists, loading, login, logout, fetchPlaylists } = useSpotify();

  // Charger depuis localStorage ou playlist par défaut
  useEffect(() => {
    const stored = localStorage.getItem('spotifyEmbedSrc');
    if (stored) {
      setEmbedSrc(stored);
    } else {
      setEmbedSrc('https://open.spotify.com/embed/playlist/37i9dQZF1DWZa8CSUr0hCY?utm_source=generator&theme=0');
    }
  }, []);

  // Charger les playlists quand l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && active) {
      fetchPlaylists();
    }
  }, [isAuthenticated, active, fetchPlaylists]);

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
    } catch (error) {
      alert('URL Spotify invalide');
    }
  };

  const handlePlaylistSelect = (playlist: any) => {
    const src = `https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=oembed&theme=0`;
    setEmbedSrc(src);
    localStorage.setItem('spotifyEmbedSrc', src);
    setShowPlaylists(false);
  };

  const handleLogout = () => {
    logout();
    setShowPlaylists(false);
  };

  const toggleCollapsed = onToggleCollapse;

  if (!active) return null;

  return (
    <>
      {/* Embed permanent en bas à droite */}
      <div className="fixed bottom-4 right-4 z-[9998] w-80 sm:w-96">
        {/* Collapsible container */}
        <div
          className="transition-transform duration-300 origin-bottom bg-[#121212]/90 backdrop-blur-md rounded-lg shadow-xl overflow-hidden"
          style={{transform: collapsed ? 'translateY(370px)' : 'translateY(0)'}}
        >
          {/* Header */}
          <div className="bg-[#121212]/90 p-3 flex items-center space-x-2 text-white">
            <Music className="w-4 h-4 flex-shrink-0 text-[#1DB954]" />
            
            {/* Mode connecté */}
            {isAuthenticated ? (
              <div className="flex-1 flex items-center space-x-2">
                <div className="flex items-center space-x-2 flex-1">
                  {user?.images?.[0] && (
                    <img 
                      src={user.images[0].url} 
                      alt="Profile" 
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-xs text-gray-300 truncate">
                    {user?.display_name || 'Spotify'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPlaylists(!showPlaylists)}
                  className="h-6 px-2 text-xs text-white hover:bg-white/20"
                >
                  <List className="w-3 h-3 mr-1" />
                  Playlists
                </Button>
                <button
                  onClick={handleLogout}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white flex-shrink-0"
                  title="Déconnexion"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              /* Mode non connecté */
              <div className="flex-1 flex items-center space-x-2">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={login}
                  className="h-6 px-2 text-xs text-white hover:bg-white/20 whitespace-nowrap"
                >
                  <User className="w-3 h-3 mr-1" />
                  Connexion
                </Button>
              </div>
            )}

            <button
              onClick={toggleCollapsed}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white flex-shrink-0"
              title="Ranger"
            >
              {collapsed ? '▴' : '▾'}
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white flex-shrink-0"
              title="Fermer"
            >
              ✕
            </button>
          </div>

          {/* Liste des playlists (mode connecté) */}
          {isAuthenticated && showPlaylists && (
            <div className="bg-[#181818] border-t border-gray-700 max-h-48 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400">
                  Chargement des playlists...
                </div>
              ) : playlists.length > 0 ? (
                <div className="p-2 space-y-1">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handlePlaylistSelect(playlist)}
                      className="w-full flex items-center space-x-3 p-2 hover:bg-white/10 rounded text-left text-white"
                    >
                      {playlist.images?.[0] && (
                        <img 
                          src={playlist.images[0].url} 
                          alt={playlist.name}
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{playlist.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {playlist.tracks.total} titres
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400">
                  Aucune playlist trouvée
                </div>
              )}
            </div>
          )}

          {/* Player iframe */}
          <iframe
            style={{ borderRadius: showPlaylists && isAuthenticated ? '0' : '0 0 12px 12px' }}
            src={embedSrc}
            width="100%"
            height="352"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </div>
    </>
  );
} 