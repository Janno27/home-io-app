import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link,
  Code,
  Edit3,
  Eye,
  Heading2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isReadMode?: boolean;
  onToggleMode?: () => void;
}

export function RichTextEditor({ value, onChange, placeholder, className, isReadMode = true, onToggleMode }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Fonction pour exécuter une commande de formatage
  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
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



  // Fonction pour insérer un lien
  const insertLink = () => {
    const url = prompt('URL du lien:');
    if (url) {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || 'Lien';
      const linkHTML = `<a href="${url}" class="text-blue-400 hover:text-blue-300 underline">${selectedText}</a>`;
      insertHTML(linkHTML);
    }
  };

  // Fonction pour insérer un sous-titre
  const insertSubtitle = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || 'Sous-titre';
    const subtitleHTML = `<h2 class="text-lg font-semibold text-white/90 mt-4 mb-2">${selectedText}</h2>`;
    insertHTML(subtitleHTML);
  };

  // Mettre à jour le contenu
  const updateContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  // Mettre à jour l'éditeur quand la valeur change
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // S'assurer que le contenu est chargé quand on passe en mode édition
  useEffect(() => {
    if (!isReadMode && editorRef.current) {
      // Attendre que l'éditeur soit rendu puis mettre à jour le contenu
      setTimeout(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
          editorRef.current.innerHTML = value;
        }
      }, 0);
    }
  }, [isReadMode, value]);

  const toolbarButtons = [
    { icon: Bold, action: () => executeCommand('bold'), title: 'Gras' },
    { icon: Italic, action: () => executeCommand('italic'), title: 'Italique' },
    { icon: Underline, action: () => executeCommand('underline'), title: 'Souligné' },
    { icon: Code, action: () => executeCommand('formatBlock', 'code'), title: 'Code' },
    { icon: List, action: insertBulletList, title: 'Liste à puces' },
    { icon: ListOrdered, action: insertNumberedList, title: 'Liste numérotée' },
    { icon: Heading2, action: insertSubtitle, title: 'Sous-titre' },
    { icon: Link, action: insertLink, title: 'Lien' },
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Sticky Toolbar */}
      {!isReadMode && (
        <div className="flex-shrink-0 sticky top-0 z-10 flex items-center p-2 border-b border-white/10 bg-white/5 rounded-t-lg backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            {toolbarButtons.map((button, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={button.action}
                className="h-8 w-8 p-0 hover:bg-white/10 text-white/70 hover:text-white flex-shrink-0"
                title={button.title}
              >
                <button.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Editor/Reader Container */}
      <div className="flex-1 relative overflow-hidden bg-white/5 rounded-b-lg">
        {isReadMode ? (
          // Mode lecture
          <div className="h-full w-full p-4 text-white overflow-y-auto">
            {value ? (
              <div 
                className="prose prose-invert max-w-none text-white/90 leading-relaxed"
                style={{ 
                  fontSize: '12px',
                  lineHeight: '1.5',
                  textAlign: 'left'
                }}
                dangerouslySetInnerHTML={{ __html: value }}
              />
            ) : (
              <div className="text-white/50 italic text-xs">
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
              className="h-full w-full p-4 text-white focus:outline-none overflow-y-auto resize-none"
              style={{ 
                minHeight: '200px',
                textAlign: 'left',
                lineHeight: '1.5',
                fontSize: '12px'
              }}
            />
            {(!value || value === '') && (
              <div className="absolute top-4 left-4 text-white/60 pointer-events-none text-xs">
                {placeholder}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 