import { Calendar } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DatePickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function DatePicker({ 
  id, 
  label, 
  value, 
  onChange, 
  disabled = false, 
  required = false 
}: DatePickerProps) {
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (disabled) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium text-gray-900 text-left block">
          {label}
        </Label>
        <div className="relative">
          <div className="h-10 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            {formatDateForDisplay(value)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-900 text-left block">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 border-gray-300 rounded-lg pr-10"
          required={required}
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}