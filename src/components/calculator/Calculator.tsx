import { useState, useRef, useEffect } from 'react';
import { X, Calculator as CalculatorIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DockAnimation } from '@/components/ui/DockAnimation';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  originPoint?: { x: number; y: number };
}

export function Calculator({ isOpen, onClose, originPoint }: CalculatorProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  // useOnClickOutside(widgetRef, onClose);

  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  
  // États pour le drag & drop et le redimensionnement
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 280, height: 400 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleDigitClick = (digit: string) => {
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const handleDecimalClick = () => {
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const handleOperatorClick = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const result = performCalculation();
      setPreviousValue(result);
      setDisplayValue(String(result));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const performCalculation = (): number => {
    const inputValue = parseFloat(displayValue);
    if (previousValue === null || operator === null) return inputValue;

    switch (operator) {
      case '+': return previousValue + inputValue;
      case '-': return previousValue - inputValue;
      case '×': return previousValue * inputValue;
      case '÷': return previousValue / inputValue;
      case '%': return previousValue % inputValue;
      default: return inputValue;
    }
  };

  const handleEqualClick = () => {
    if (!operator) return;
    const result = performCalculation();
    setDisplayValue(String(result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const handleClearClick = () => {
    setDisplayValue('0');
    setOperator(null);
    setPreviousValue(null);
    setWaitingForOperand(false);
  };
  
  const handleToggleSignClick = () => {
    setDisplayValue(String(parseFloat(displayValue) * -1));
  };

  // Gestion du clavier
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Empêcher le comportement par défaut pour les touches que nous gérons
      if (/[0-9+\-*/.=]|Enter|Escape|Backspace/.test(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
          handleDigitClick(e.key);
          break;
        case '+':
          handleOperatorClick('+');
          break;
        case '-':
          handleOperatorClick('-');
          break;
        case '*':
          handleOperatorClick('×');
          break;
        case '/':
          handleOperatorClick('÷');
          break;
        case '%':
          handleOperatorClick('%');
          break;
        case '.':
        case ',':
          handleDecimalClick();
          break;
        case '=':
        case 'Enter':
          handleEqualClick();
          break;
        case 'Escape':
          onClose();
          break;
        case 'Backspace':
          if (displayValue.length > 1) {
            setDisplayValue(displayValue.slice(0, -1));
          } else {
            setDisplayValue('0');
          }
          break;
        case 'c':
        case 'C':
          handleClearClick();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, displayValue, handleDigitClick, handleOperatorClick, handleDecimalClick, handleEqualClick, handleClearClick, onClose]);

  // Gestion du drag & drop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
                 const deltaY = e.clientY - resizeStart.y;
        setSize({
          width: Math.max(200, resizeStart.width + deltaX),
          height: Math.max(280, resizeStart.height + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);


  return (
    <DockAnimation isOpen={isOpen} originPoint={originPoint}>
      <div className="flex items-start justify-end pr-4 h-full pointer-events-none pt-32">
        <div 
          ref={widgetRef} 
          className="bg-gray-100/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg overflow-hidden pointer-events-auto flex flex-col relative select-none"
          style={{
            width: size.width,
            height: size.height,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging || isResizing ? 'none' : 'all 0.2s ease-out',
            cursor: isDragging ? 'grabbing' : 'default'
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Header */}
          <div 
            ref={headerRef}
            className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center space-x-2">
              <CalculatorIcon className="w-4 h-4 text-gray-600" />
              <h3 className="text-gray-600 text-sm font-medium">
                Calculatrice
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div 
            className="flex-grow overflow-auto"
            style={{ 
              padding: Math.max(8, size.width * 0.03),
            }}
          >
            {/* Display */}
            <div 
              className="bg-white/10 rounded-lg text-right mb-4 overflow-x-auto"
              style={{ 
                padding: Math.max(8, size.width * 0.03),
                marginBottom: Math.max(8, size.height * 0.02)
              }}
            >
              <span 
                className="font-mono text-gray-700 break-all"
                style={{ 
                  fontSize: Math.max(16, Math.min(36, size.width * 0.1))
                }}
              >
                {displayValue}
              </span>
            </div>

            {/* Buttons */}
            <div 
              className="grid grid-cols-4"
              style={{ 
                gap: Math.max(4, size.width * 0.015)
              }}
            >
              {/* Opérateurs */}
              <Button 
                onClick={handleClearClick} 
                variant="ghost" 
                className="bg-white/5 hover:bg-white/10 text-gray-700"
                style={{ 
                  height: Math.max(40, size.height * 0.08),
                  fontSize: Math.max(12, size.width * 0.04)
                }}
              >
                AC
              </Button>
              <Button 
                onClick={handleToggleSignClick} 
                variant="ghost" 
                className="bg-white/5 hover:bg-white/10 text-gray-700"
                style={{ 
                  height: Math.max(40, size.height * 0.08),
                  fontSize: Math.max(12, size.width * 0.04)
                }}
              >
                +/-
              </Button>
              <Button 
                onClick={() => handleOperatorClick('%')} 
                variant="ghost" 
                className="bg-white/5 hover:bg-white/10 text-gray-700"
                style={{ 
                  height: Math.max(40, size.height * 0.08),
                  fontSize: Math.max(12, size.width * 0.04)
                }}
              >
                %
              </Button>
              <Button 
                onClick={() => handleOperatorClick('÷')} 
                variant="ghost" 
                className="bg-orange-500/80 hover:bg-orange-500/90 text-white"
                style={{ 
                  height: Math.max(40, size.height * 0.08),
                  fontSize: Math.max(12, size.width * 0.04)
                }}
              >
                ÷
              </Button>
              
              {/* Nombres ligne 1 */}
              {['7', '8', '9'].map(digit => (
                <Button 
                  key={digit}
                  onClick={() => handleDigitClick(digit)} 
                  variant="ghost" 
                  className="bg-white/15 hover:bg-white/20 text-gray-700"
                  style={{ 
                    height: Math.max(40, size.height * 0.08),
                    fontSize: Math.max(12, size.width * 0.04)
                  }}
                >
                  {digit}
                </Button>
              ))}
              <Button 
                onClick={() => handleOperatorClick('×')} 
                variant="ghost" 
                className="bg-orange-500/80 hover:bg-orange-500/90 text-white"
                style={{ 
                  height: Math.max(40, size.height * 0.08),
                  fontSize: Math.max(12, size.width * 0.04)
                }}
              >
                ×
              </Button>
              
              {/* Nombres ligne 2 */}
              {['4', '5', '6'].map(digit => (
                <Button 
                  key={digit}
                  onClick={() => handleDigitClick(digit)} 
                  variant="ghost" 
                  className="bg-white/15 hover:bg-white/20 text-gray-700"
                  style={{ 
                    height: Math.max(40, size.height * 0.08),
                    fontSize: Math.max(12, size.width * 0.04)
                  }}
                >
                  {digit}
                </Button>
              ))}
              <Button 
                onClick={() => handleOperatorClick('-')} 
                variant="ghost" 
                className="bg-orange-500/80 hover:bg-orange-500/90 text-white"
                style={{ 
                  height: Math.max(40, size.height * 0.08),
                  fontSize: Math.max(12, size.width * 0.04)
                }}
              >
                -
              </Button>

              {/* Nombres ligne 3 */}
              {['1', '2', '3'].map(digit => (
                <Button 
                  key={digit}
                  onClick={() => handleDigitClick(digit)} 
                  variant="ghost" 
                  className="bg-white/15 hover:bg-white/20 text-gray-700"
                  style={{ 
                    height: Math.max(40, size.height * 0.08),
                    fontSize: Math.max(12, size.width * 0.04)
                  }}
                >
                  {digit}
                </Button>
              ))}
              <Button 
                onClick={() => handleOperatorClick('+')} 
                variant="ghost" 
                className="bg-orange-500/80 hover:bg-orange-500/90 text-white"
                style={{ 
                  height: Math.max(40, size.height * 0.08),
                  fontSize: Math.max(12, size.width * 0.04)
                }}
              >
                +
              </Button>
              
              {/* Dernière ligne */}
              <Button 
                onClick={() => handleDigitClick('0')} 
                variant="ghost" 
                className="col-span-2 bg-white/15 hover:bg-white/20 text-gray-700"
                style={{ 
                  height: Math.max(40, size.height * 0.08),
                  fontSize: Math.max(12, size.width * 0.04)
                }}
              >
                0
              </Button>
              <Button 
                onClick={handleDecimalClick} 
                variant="ghost" 
                className="bg-white/15 hover:bg-white/20 text-gray-700"
                style={{ 
                  height: Math.max(40, size.height * 0.08),
                  fontSize: Math.max(12, size.width * 0.04)
                }}
              >
                .
              </Button>
              <Button 
                onClick={handleEqualClick} 
                variant="ghost" 
                className="bg-orange-500/80 hover:bg-orange-500/90 text-white"
                style={{ 
                  height: Math.max(40, size.height * 0.08),
                  fontSize: Math.max(12, size.width * 0.04)
                }}
              >
                =
              </Button>
            </div>
          </div>

          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
          />
        </div>
      </div>
    </DockAnimation>
  );
} 