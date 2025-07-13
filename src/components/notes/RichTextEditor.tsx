import { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Code,
  Heading2,
  Heading3,
  CheckSquare,
  type LucideProps,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isReadMode?: boolean;
  onToggleMode?: () => void;
}

type ToolbarButton = {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  action: () => void;
  title: string;
  type?: undefined;
};

type ToolbarDivider = {
  type: 'divider';
  icon?: undefined;
  action?: undefined;
  title?: undefined;
};

type ToolbarItem = ToolbarButton | ToolbarDivider;

export function RichTextEditor({ value, onChange, placeholder, className, isReadMode = true }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Fonction pour sauvegarder la position du curseur
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    
    return preCaretRange.toString().length;
  };

  // Fonction pour restaurer la position du curseur
  const restoreCursorPosition = (position: number) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentPosition = 0;
    let node;
    
    while (node = walker.nextNode()) {
      const textNode = node as Text;
      const textLength = textNode.textContent?.length || 0;
      
      if (currentPosition + textLength >= position) {
        const range = document.createRange();
        const offset = position - currentPosition;
        range.setStart(textNode, Math.min(offset, textLength));
        range.setEnd(textNode, Math.min(offset, textLength));
        
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
      
      currentPosition += textLength;
    }

    // Si on n'a pas trouvé la position exacte, placer à la fin
    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  // Fonction pour exécuter une commande de formatage
  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  // Fonction pour insérer un titre H2
  const insertHeading2 = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;
    
    editorRef.current.focus();
    
    const selectedText = selection.toString().trim();
    const headingText = selectedText || 'Titre 2';
    
    const headingHTML = `<h2 class="text-xl font-bold mt-4 mb-2">${headingText}</h2>`;
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const div = document.createElement('div');
      div.innerHTML = headingHTML;
      const fragment = document.createDocumentFragment();
      let node;
      while ((node = div.firstChild)) {
        fragment.appendChild(node);
      }
      range.insertNode(fragment);
    }
    
    updateContent();
  };

  // Fonction pour insérer un titre H3
  const insertHeading3 = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;
    
    editorRef.current.focus();
    
    const selectedText = selection.toString().trim();
    const headingText = selectedText || 'Titre 3';
    
    const headingHTML = `<h3 class="text-lg font-semibold mt-3 mb-2">${headingText}</h3>`;
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const div = document.createElement('div');
      div.innerHTML = headingHTML;
      const fragment = document.createDocumentFragment();
      let node;
      while ((node = div.firstChild)) {
        fragment.appendChild(node);
      }
      range.insertNode(fragment);
    }
    
    updateContent();
  };

  // Fonction pour insérer une checkbox (tâche)
  const insertCheckbox = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;
    
    editorRef.current.focus();

    const selectedText = selection.toString().trim();
    if (selectedText) {
      const lines = selectedText.split('\n').filter(line => line.trim());
      const html = lines.map(line => 
        `<div class="flex items-center my-1" contenteditable="true">
           <input type="checkbox" class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" contenteditable="false"/>
           <span>${line.trim()}</span>
         </div>`
      ).join('');
      document.execCommand('insertHTML', false, html);
    } else {
      const checkboxHTML = 
       `<div class="flex items-center my-1" contenteditable="true">
          <input type="checkbox" class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" contenteditable="false"/>
          <span>&nbsp;</span>
        </div>`;
      document.execCommand('insertHTML', false, checkboxHTML);
    }
    updateContent();
  };

  // Fonction pour insérer une liste à puces
  const insertBulletList = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      
      if (selectedText) {
        // Si du texte est sélectionné, le transformer en liste
        const listItems = selectedText.split('\n').filter(line => line.trim())
          .map(line => `<li>${line.trim()}</li>`).join('');
        const listHTML = `<ul class="list-disc ml-6 my-2">${listItems}</ul>`;
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = listHTML;
        const fragment = document.createDocumentFragment();
        let node;
        while ((node = div.firstChild)) {
          fragment.appendChild(node);
        }
        range.insertNode(fragment);
      } else {
        // Insérer une nouvelle liste
        const listHTML = '<ul class="list-disc ml-6 my-2"><li>Élément de liste</li></ul>';
        insertHTML(listHTML);
      }
    }
    updateContent();
  };

  // Fonction pour insérer une liste numérotée
  const insertNumberedList = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      
      if (selectedText) {
        // Si du texte est sélectionné, le transformer en liste
        const listItems = selectedText.split('\n').filter(line => line.trim())
          .map(line => `<li>${line.trim()}</li>`).join('');
        const listHTML = `<ol class="list-decimal ml-6 my-2">${listItems}</ol>`;
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = listHTML;
        const fragment = document.createDocumentFragment();
        let node;
        while ((node = div.firstChild)) {
          fragment.appendChild(node);
        }
        range.insertNode(fragment);
      } else {
        // Insérer une nouvelle liste
        const listHTML = '<ol class="list-decimal ml-6 my-2"><li>Élément numéroté</li></ol>';
        insertHTML(listHTML);
      }
    }
    updateContent();
  };

  // Fonction pour insérer du HTML à la position du curseur
  const insertHTML = (html: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const div = document.createElement('div');
      div.innerHTML = html;
      const fragment = document.createDocumentFragment();
      let node;
      while ((node = div.firstChild)) {
        fragment.appendChild(node);
      }
      range.insertNode(fragment);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    updateContent();
  };



  // Mettre à jour le contenu
  const updateContent = () => {
    if (editorRef.current && !isUpdatingRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  // Mettre à jour l'éditeur quand la valeur change (uniquement si différente)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && !isUpdatingRef.current) {
      const cursorPosition = saveCursorPosition();
      
      isUpdatingRef.current = true;
      editorRef.current.innerHTML = value;
      
      // Restaurer la position du curseur après la mise à jour
      if (cursorPosition !== null && !isReadMode) {
        setTimeout(() => {
          restoreCursorPosition(cursorPosition);
          isUpdatingRef.current = false;
        }, 0);
      } else {
        isUpdatingRef.current = false;
      }
    }
  }, [value, isReadMode]);

  // S'assurer que le contenu est chargé quand on passe en mode édition
  useEffect(() => {
    if (!isReadMode && editorRef.current) {
      // Attendre que l'éditeur soit rendu puis mettre à jour le contenu
      setTimeout(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value && !isUpdatingRef.current) {
          isUpdatingRef.current = true;
          editorRef.current.innerHTML = value;
          isUpdatingRef.current = false;
        }
      }, 0);
    }
  }, [isReadMode]);

  const toolbarButtons: ToolbarItem[] = [
    { icon: Bold, action: () => executeCommand('bold'), title: 'Gras' },
    { icon: Italic, action: () => executeCommand('italic'), title: 'Italique' },
    { icon: Underline, action: () => executeCommand('underline'), title: 'Souligné' },
    { icon: Code, action: () => executeCommand('formatBlock', 'pre'), title: 'Code' },
    { type: 'divider' },
    { icon: Heading2, action: insertHeading2, title: 'Titre 2' },
    { icon: Heading3, action: insertHeading3, title: 'Titre 3' },
    { type: 'divider' },
    { icon: List, action: insertBulletList, title: 'Liste à puces' },
    { icon: ListOrdered, action: insertNumberedList, title: 'Liste numérotée' },
    { icon: CheckSquare, action: insertCheckbox, title: 'Case à cocher' },
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Sticky Toolbar */}
      {!isReadMode && (
        <div className="flex-shrink-0 sticky top-0 z-10 flex items-center p-2 border-b border-white/10 bg-white/15 rounded-t-lg backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            {toolbarButtons.map((button, index) => {
              if (button.type === 'divider') {
                return <div key={index} className="h-6 w-px bg-white/20 mx-1"></div>;
              }
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  onMouseDown={(e) => e.preventDefault()}
                  className="h-8 w-8 p-0 hover:bg-white/20 text-gray-500 hover:text-gray-700 flex-shrink-0"
                  title={button.title}
                >
                  <button.icon className="w-4 h-4" />
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Editor/Reader Container */}
              <div className="flex-1 relative overflow-hidden bg-white/10 rounded-b-lg">
        {isReadMode ? (
          // Mode lecture
          <div className="h-full w-full p-4 overflow-y-auto">
            {value ? (
              <div 
                className="prose prose-sm prose-invert max-w-none leading-relaxed"
                style={{ 
                  textAlign: 'left'
                }}
                dangerouslySetInnerHTML={{ __html: value }}
              />
            ) : (
              <div className="text-gray-500 italic text-xs">
                {placeholder || 'Aucun contenu à afficher'}
              </div>
            )}
          </div>
        ) : (
          // Mode édition
          <>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={updateContent}
              className="prose prose-sm prose-invert max-w-none h-full w-full p-4 focus:outline-none overflow-y-auto resize-none"
              style={{ 
                minHeight: '200px',
                textAlign: 'left',
              }}
            />
            {(!value || value === '') && (
              <div className="absolute top-4 left-4 text-gray-500 pointer-events-none text-xs">
                {placeholder}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 