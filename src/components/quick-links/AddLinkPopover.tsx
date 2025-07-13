import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AddLinkPopoverProps {
  children: React.ReactNode;
  onAddLink: (link: { url: string }) => Promise<void>;
}

export function AddLinkPopover({ children, onAddLink }: AddLinkPopoverProps) {
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAdd = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      await onAddLink({ url });
      setUrl('');
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add link", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input 
            type="text" 
            placeholder="Entrez une URL (ex: google.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()} 
          />
          <Button type="submit" onClick={handleAdd} disabled={isLoading} size="sm">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ajouter'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
} 