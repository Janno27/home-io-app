import { useRef, useEffect, useCallback, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Commencez à écrire...", 
  className
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Détecter les formats actifs à la position du curseur
  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;

    const formats = new Set<string>();
    
    try {
      if (document.queryCommandState('bold')) formats.add('bold');
      if (document.queryCommandState('italic')) formats.add('italic');
      if (document.queryCommandState('underline')) formats.add('underline');
      if (document.queryCommandValue('formatBlock') === 'h2') formats.add('h2');
      if (document.queryCommandValue('formatBlock') === 'h3') formats.add('h3');
      if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
      if (document.queryCommandState('insertOrderedList')) formats.add('ol');
    } catch (e) {
      // Ignorer les erreurs de queryCommand
    }

    setActiveFormats(formats);
  }, []);

  // Mettre à jour le contenu de l'éditeur
  const updateContent = useCallback(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      onChange(htmlContent);
    }
  }, [onChange]);

  // Sauvegarder et restaurer la position du curseur
  const saveSelection = useCallback(() => {
    if (!editorRef.current) return null;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    try {
    const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(editorRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;
      
      return {
        start,
        end: start + range.toString().length
      };
    } catch (e) {
      return null;
    }
  }, []);

  const restoreSelection = useCallback((savedSelection: { start: number; end: number } | null) => {
    if (!savedSelection || !editorRef.current) return;
    
    try {
    const selection = window.getSelection();
    if (!selection) return;

      const range = document.createRange();
      let charIndex = 0;
      let nodeStack: Node[] = [editorRef.current];
      let node: Node | undefined;
      let foundStart = false;
      let stop = false;
      
      while (!stop && (node = nodeStack.pop())) {
        if (node.nodeType === Node.TEXT_NODE) {
          const nextCharIndex = charIndex + (node.textContent?.length || 0);
          if (!foundStart && savedSelection.start >= charIndex && savedSelection.start <= nextCharIndex) {
            range.setStart(node, savedSelection.start - charIndex);
            foundStart = true;
          }
          if (foundStart && savedSelection.end >= charIndex && savedSelection.end <= nextCharIndex) {
            range.setEnd(node, savedSelection.end - charIndex);
            stop = true;
          }
          charIndex = nextCharIndex;
        } else {
          let i = node.childNodes.length;
          while (i--) {
            nodeStack.push(node.childNodes[i]);
          }
        }
      }
        
        selection.removeAllRanges();
        selection.addRange(range);
    } catch (e) {
      // Ignorer les erreurs de restauration
    }
  }, []);

  // Synchroniser le contenu avec la prop value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && !isUpdatingRef.current) {
      // Sauvegarder la position du curseur avant la mise à jour
      const savedSelection = saveSelection();
      
      isUpdatingRef.current = true;
      editorRef.current.innerHTML = value || '';
      isUpdatingRef.current = false;
      
      // Restaurer la position du curseur après la mise à jour
      if (savedSelection) {
        setTimeout(() => restoreSelection(savedSelection), 0);
      }
    }
  }, [value, saveSelection, restoreSelection]);

  // Focus automatique en mode édition
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Exécuter une commande de formatage
  const executeCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    document.execCommand(command, false, value);
    updateContent();
  }, [updateContent]);

  // Fonctions de formatage
  const formatBold = useCallback(() => {
    executeCommand('bold');
  }, [executeCommand]);

  const formatItalic = useCallback(() => {
    executeCommand('italic');
  }, [executeCommand]);

  const formatUnderline = useCallback(() => {
    executeCommand('underline');
  }, [executeCommand]);

  const formatCode = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      
      if (selectedText) {
        const codeElement = document.createElement('code');
        codeElement.style.backgroundColor = '#f3f4f6';
        codeElement.style.padding = '0.25rem 0.5rem';
        codeElement.style.borderRadius = '0.25rem';
        codeElement.style.fontFamily = 'monospace';
        codeElement.style.fontSize = '0.875rem';
        codeElement.style.color = '#1f2937';
        codeElement.style.border = '1px solid #d1d5db';
        codeElement.textContent = selectedText;
        
      range.deleteContents();
        range.insertNode(codeElement);
        
        // Placer le curseur après l'élément code
        range.setStartAfter(codeElement);
        range.setEndAfter(codeElement);
        selection.removeAllRanges();
        selection.addRange(range);
        
        updateContent();
      }
    }
  }, [updateContent]);

  const formatHeading2 = useCallback(() => {
    executeCommand('formatBlock', 'h2');
    // Appliquer les styles après la commande
    setTimeout(() => {
      if (editorRef.current) {
        const h2Elements = editorRef.current.querySelectorAll('h2');
        h2Elements.forEach(h2 => {
          (h2 as HTMLElement).style.fontSize = '1.5rem';
          (h2 as HTMLElement).style.fontWeight = 'bold';
          (h2 as HTMLElement).style.color = '#1f2937';
          (h2 as HTMLElement).style.margin = '1.5rem 0 1rem 0';
          (h2 as HTMLElement).style.lineHeight = '1.3';
        });
        updateContent();
      }
    }, 0);
  }, [executeCommand, updateContent]);

  const formatHeading3 = useCallback(() => {
    executeCommand('formatBlock', 'h3');
    // Appliquer les styles après la commande
    setTimeout(() => {
      if (editorRef.current) {
        const h3Elements = editorRef.current.querySelectorAll('h3');
        h3Elements.forEach(h3 => {
          (h3 as HTMLElement).style.fontSize = '1.25rem';
          (h3 as HTMLElement).style.fontWeight = '600';
          (h3 as HTMLElement).style.color = '#1f2937';
          (h3 as HTMLElement).style.margin = '1rem 0 0.75rem 0';
          (h3 as HTMLElement).style.lineHeight = '1.3';
        });
        updateContent();
      }
    }, 0);
  }, [executeCommand, updateContent]);

  const formatBulletList = useCallback(() => {
    executeCommand('insertUnorderedList');
    // Appliquer les styles après la commande
    setTimeout(() => {
      if (editorRef.current) {
        const ulElements = editorRef.current.querySelectorAll('ul');
        ulElements.forEach(ul => {
          (ul as HTMLElement).style.marginLeft = '1.5rem';
          (ul as HTMLElement).style.marginTop = '0.5rem';
          (ul as HTMLElement).style.marginBottom = '0.5rem';
        });
        const liElements = editorRef.current.querySelectorAll('ul li');
        liElements.forEach(li => {
          (li as HTMLElement).style.listStyleType = 'disc';
          (li as HTMLElement).style.color = '#374151';
          (li as HTMLElement).style.lineHeight = '1.5';
          (li as HTMLElement).style.marginBottom = '0.25rem';
        });
        updateContent();
      }
    }, 0);
  }, [executeCommand, updateContent]);

  const formatNumberedList = useCallback(() => {
    executeCommand('insertOrderedList');
    // Appliquer les styles après la commande
    setTimeout(() => {
      if (editorRef.current) {
        const olElements = editorRef.current.querySelectorAll('ol');
        olElements.forEach(ol => {
          (ol as HTMLElement).style.marginLeft = '1.5rem';
          (ol as HTMLElement).style.marginTop = '0.5rem';
          (ol as HTMLElement).style.marginBottom = '0.5rem';
        });
        const liElements = editorRef.current.querySelectorAll('ol li');
        liElements.forEach(li => {
          (li as HTMLElement).style.listStyleType = 'decimal';
          (li as HTMLElement).style.color = '#374151';
          (li as HTMLElement).style.lineHeight = '1.5';
          (li as HTMLElement).style.marginBottom = '0.25rem';
        });
    updateContent();
      }
    }, 0);
  }, [executeCommand, updateContent]);

  const formatCheckbox = useCallback(() => {
    if (!editorRef.current) return;

    // Éviter de créer plusieurs inline editors
    if (editorRef.current.querySelector('.checkbox-inline-editor')) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Créer l'overlay pour le textarea
    const overlay = document.createElement('div');

    // Empêcher la propagation des clics et des touchers pour ne pas fermer la note
    overlay.addEventListener('mousedown', e => e.stopPropagation());
    overlay.addEventListener('touchstart', e => e.stopPropagation());

    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(2px);
    `;

    // Créer le conteneur du modal
    const modal = document.createElement('div');

    // Empêcher la propagation du clic pour ne pas fermer la note
    modal.addEventListener('click', e => e.stopPropagation());

    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      max-height: 300px;
    `;

    // Créer le titre
    const title = document.createElement('h3');
    title.textContent = 'Nouvelle case à cocher';
    title.style.cssText = `
      margin: 0 0 16px 0;
      color: #1f2937;
      font-size: 18px;
      font-weight: 600;
    `;

    // Créer le textarea
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Saisissez le contenu de votre tâche...';
    textarea.style.cssText = `
      width: 100%;
      min-height: 80px;
      max-height: 120px;
      padding: 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.5;
      color: #374151;
      outline: none;
      resize: vertical;
      margin-bottom: 16px;
    `;

    // Créer les boutons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    `;

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Annuler';
    cancelButton.style.cssText = `
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      background: white;
      color: #6b7280;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    `;

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Créer';
    confirmButton.style.cssText = `
      padding: 8px 16px;
      border: none;
      background: #3b82f6;
      color: white;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    `;

    // Fonction pour créer la checkbox
    const createCheckbox = (content: string) => {
      if (!content.trim()) return;

      const checkboxId = `checkbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const checkboxDiv = document.createElement('div');
      checkboxDiv.className = 'checkbox-container';
      checkboxDiv.setAttribute('data-checkbox-id', checkboxId);
      
      checkboxDiv.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 0.75rem; margin: 0.5rem 0; width: 100%; max-width: 100%;">
          <input 
            type="checkbox" 
            data-checkbox-id="${checkboxId}"
            style="width: 1rem; height: 1rem; margin-top: 0.125rem; border-radius: 0.25rem; flex-shrink: 0;"
          />
          <span 
            contenteditable="true"
            data-checkbox-text="${checkboxId}"
            style="flex: 1; word-wrap: break-word; white-space: pre-wrap; overflow-wrap: break-word; color: #374151; line-height: 1.5; outline: none;"
          >${content}</span>
        </div>
      `;
      
      range.deleteContents();
      range.insertNode(checkboxDiv);
      
      // Ajouter un paragraphe après la checkbox pour continuer l'édition
      const p = document.createElement('p');
      p.style.cssText = 'color: #374151; line-height: 1.6; margin: 0.5rem 0; text-align: left;';
      p.innerHTML = '<br>';
      checkboxDiv.parentNode?.insertBefore(p, checkboxDiv.nextSibling);
      
      // Placer le curseur dans le nouveau paragraphe
      const newRange = document.createRange();
      newRange.setStart(p, 0);
      newRange.setEnd(p, 0);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      updateContent();
      overlay.remove();
    };

    // Gestionnaires d'événements
    const handleConfirm = () => {
      createCheckbox(textarea.value);
    };

    const handleCancel = () => {
      overlay.remove();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    // Styles de survol pour les boutons
    cancelButton.onmouseenter = () => {
      cancelButton.style.background = '#f9fafb';
      cancelButton.style.borderColor = '#9ca3af';
    };
    cancelButton.onmouseleave = () => {
      cancelButton.style.background = 'white';
      cancelButton.style.borderColor = '#d1d5db';
    };

    confirmButton.onmouseenter = () => {
      confirmButton.style.background = '#2563eb';
    };
    confirmButton.onmouseleave = () => {
      confirmButton.style.background = '#3b82f6';
    };

    // Ajouter les événements
    confirmButton.onclick = handleConfirm;
    cancelButton.onclick = handleCancel;
    textarea.onkeydown = handleKeyDown;
    overlay.onclick = (e) => {
      if (e.target === overlay) handleCancel();
    };

    // Construire le modal
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(confirmButton);
    modal.appendChild(title);
    modal.appendChild(textarea);
    modal.appendChild(buttonsContainer);
    overlay.appendChild(modal);

    // Ajouter au DOM et focus
    document.body.appendChild(overlay);
    textarea.focus();

    // Instructions dans le placeholder
    const instructions = document.createElement('div');
    instructions.textContent = 'Ctrl+Entrée pour créer, Échap pour annuler';
    instructions.style.cssText = `
      font-size: 12px;
      color: #6b7280;
      margin-top: 8px;
      text-align: center;
    `;
    modal.insertBefore(instructions, buttonsContainer);

  }, [updateContent]);

  // Gestionnaire de raccourcis clavier
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Gestion de la hiérarchie des listes avec Tab et Shift+Tab
    if (e.key === 'Tab') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const containerElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
          ? range.commonAncestorContainer.parentElement 
          : range.commonAncestorContainer as Element;
        const listItem = containerElement?.closest('li');
        
        if (listItem) {
          e.preventDefault();
          
          if (e.shiftKey) {
            // Shift+Tab : remonter d'un niveau (outdent)
            const parentList = listItem.parentElement;
            const grandParentItem = parentList?.parentElement?.closest('li');
            
            if (grandParentItem) {
              const grandParentList = grandParentItem.parentElement;
              const nextSibling = listItem.nextElementSibling;
              
              // Déplacer l'élément au niveau supérieur
              grandParentList?.insertBefore(listItem, grandParentItem.nextSibling);
              
              // Si l'élément avait des frères suivants, les déplacer dans une sous-liste
              if (nextSibling && parentList) {
                const newSubList = document.createElement(parentList.tagName.toLowerCase());
                newSubList.style.marginLeft = '1.5rem';
                newSubList.style.marginTop = '0.25rem';
                newSubList.style.marginBottom = '0.25rem';
                
                while (nextSibling) {
                  const next = nextSibling.nextElementSibling;
                  newSubList.appendChild(nextSibling);
                  if (!next) break;
                }
                
                if (newSubList.children.length > 0) {
                  listItem.appendChild(newSubList);
                }
              }
              
              // Supprimer la liste parent si elle est vide
              if (parentList && parentList.children.length === 0) {
                parentList.remove();
              }
              
              // Placer le curseur
              const newRange = document.createRange();
              newRange.setStart(listItem, 0);
              newRange.setEnd(listItem, 0);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          } else {
            // Tab : descendre d'un niveau (indent)
            const previousSibling = listItem.previousElementSibling as HTMLLIElement;
            
            if (previousSibling) {
              const parentList = listItem.parentElement;
              const listType = parentList?.tagName.toLowerCase();
              
              // Chercher s'il y a déjà une sous-liste dans l'élément précédent
              let subList = previousSibling.querySelector(':scope > ul, :scope > ol') as HTMLElement;
              
              if (!subList) {
                // Créer une nouvelle sous-liste
                subList = document.createElement(listType || 'ul');
                subList.style.marginLeft = '1.5rem';
                subList.style.marginTop = '0.25rem';
                subList.style.marginBottom = '0.25rem';
                previousSibling.appendChild(subList);
              }
              
              // Déplacer l'élément dans la sous-liste
              subList.appendChild(listItem);
              
              // Appliquer les styles appropriés
              const liElements = subList.querySelectorAll('li');
              liElements.forEach(li => {
                (li as HTMLElement).style.listStyleType = listType === 'ol' ? 'decimal' : 'disc';
                (li as HTMLElement).style.color = '#374151';
                (li as HTMLElement).style.lineHeight = '1.5';
                (li as HTMLElement).style.marginBottom = '0.25rem';
              });
              
              // Placer le curseur
              const newRange = document.createRange();
              newRange.setStart(listItem, 0);
              newRange.setEnd(listItem, 0);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
          
          updateContent();
          return;
        }
      }
    }
    
    // Gestion spéciale de la touche Entrée dans les checkboxes
    if (e.key === 'Enter') {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const checkboxSpan = (container.nodeType === Node.TEXT_NODE ? container.parentElement : container) as HTMLElement;
        
        // Si on est dans un span de checkbox
        if (checkboxSpan && checkboxSpan.hasAttribute('data-checkbox-text')) {
          e.preventDefault();
          
          // Créer une nouvelle ligne après le conteneur de la checkbox
          const checkboxContainer = checkboxSpan.closest('.checkbox-container');
          if (checkboxContainer) {
            const br = document.createElement('br');
            const p = document.createElement('p');
            p.style.color = '#374151';
            p.style.lineHeight = '1.6';
            p.style.margin = '0.5rem 0';
            p.style.textAlign = 'left';
            p.appendChild(br);
            
            checkboxContainer.parentNode?.insertBefore(p, checkboxContainer.nextSibling);
            
            // Placer le curseur dans le nouveau paragraphe
            const newRange = document.createRange();
            newRange.setStart(p, 0);
            newRange.setEnd(p, 0);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            updateContent();
            return;
          }
        }
      }
    }
    
    // Raccourcis clavier standards
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatBold();
          break;
        case 'i':
          e.preventDefault();
          formatItalic();
          break;
        case 'u':
          e.preventDefault();
          formatUnderline();
          break;
        default:
          break;
      }
    }
  }, [formatBold, formatItalic, formatUnderline, updateContent]);

  // Appliquer les styles de base aux éléments
  const applyBaseStyles = useCallback(() => {
    if (!editorRef.current) return;

    // Style pour les paragraphes
    const pElements = editorRef.current.querySelectorAll('p');
    pElements.forEach(p => {
      (p as HTMLElement).style.color = '#374151';
      (p as HTMLElement).style.lineHeight = '1.6';
      (p as HTMLElement).style.margin = '0.5rem 0';
      (p as HTMLElement).style.textAlign = 'left';
    });

    // Style pour le texte en gras
    const strongElements = editorRef.current.querySelectorAll('strong, b');
    strongElements.forEach(strong => {
      (strong as HTMLElement).style.fontWeight = 'bold';
      (strong as HTMLElement).style.color = '#1f2937';
    });

    // Style pour le texte en italique
    const emElements = editorRef.current.querySelectorAll('em, i');
    emElements.forEach(em => {
      (em as HTMLElement).style.fontStyle = 'italic';
      (em as HTMLElement).style.color = '#374151';
    });

    // Style pour le texte souligné
    const uElements = editorRef.current.querySelectorAll('u');
    uElements.forEach(u => {
      (u as HTMLElement).style.textDecoration = 'underline';
      (u as HTMLElement).style.color = '#374151';
    });

    // Gérer les checkboxes existantes de manière plus fiable
    const checkboxes = editorRef.current.querySelectorAll('input[type="checkbox"][data-checkbox-id]');
    checkboxes.forEach(checkbox => {
      const input = checkbox as HTMLInputElement;
      const checkboxId = input.getAttribute('data-checkbox-id');
      if (!checkboxId) return;
      
      const span = editorRef.current!.querySelector(`[data-checkbox-text="${checkboxId}"]`) as HTMLElement;
      if (!span) return;
      
      // Synchroniser l'état visuel avec l'état de la checkbox
      const isChecked = input.hasAttribute('checked') || input.checked;
      
      if (isChecked) {
        span.style.textDecoration = 'line-through';
        span.style.color = '#6b7280';
        input.checked = true;
      } else {
        span.style.textDecoration = 'none';
        span.style.color = '#374151';
        input.checked = false;
      }
      
      // Gérer l'édition selon le mode
      span.contentEditable = 'true';
      span.style.cursor = 'text';
      span.style.outline = 'none';
      
      // S'assurer que les styles de base sont appliqués
      span.style.flex = '1';
      span.style.wordWrap = 'break-word';
      span.style.whiteSpace = 'pre-wrap';
      span.style.overflowWrap = 'break-word';
             span.style.lineHeight = '1.5';
     });
   }, []);

  // Gestionnaire universel de checkbox
  const handleCheckboxChange = useCallback((checkbox: HTMLInputElement) => {
    const checkboxId = checkbox.getAttribute('data-checkbox-id');
    if (!checkboxId) return;
    
    const span = document.querySelector(`[data-checkbox-text="${checkboxId}"]`) as HTMLElement;
    if (!span) return;
    
    // Appliquer le style selon l'état
    if (checkbox.checked) {
      span.style.textDecoration = 'line-through';
      span.style.color = '#6b7280';
      checkbox.setAttribute('checked', 'checked');
    } else {
      span.style.textDecoration = 'none';
      span.style.color = '#374151';
      checkbox.removeAttribute('checked');
    }
    
    updateContent();
  }, [updateContent]);

  // Gestionnaire de clic pour les checkboxes existantes
  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // Si on clique sur une checkbox
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      e.stopPropagation();
      // Délai pour laisser le checkbox se mettre à jour naturellement
      setTimeout(() => {
        handleCheckboxChange(target);
      }, 0);
      return;
    }
    
    // Mettre à jour les formats actifs après un clic
    setTimeout(updateActiveFormats, 0);
  }, [handleCheckboxChange, updateActiveFormats]);

  // Gestionnaire de changement de sélection
  const handleSelectionChange = useCallback(() => {
    if (editorRef.current && document.activeElement === editorRef.current) {
      updateActiveFormats();
    }
  }, [updateActiveFormats]);

  // Gestionnaire d'input avec debounce pour éviter les mises à jour trop fréquentes
  const handleInput = useCallback(() => {
    if (isUpdatingRef.current) return;
    
    // Délai pour éviter les conflits avec la saisie
    setTimeout(() => {
      applyBaseStyles();
      updateContent();
      updateActiveFormats();
    }, 0);
  }, [applyBaseStyles, updateContent, updateActiveFormats]);

  // Appliquer les styles après chaque mise à jour
  useEffect(() => {
    applyBaseStyles();
  }, [value, applyBaseStyles]);

  // Ajouter l'event listener pour les changements de sélection
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
  return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
  };
  }, [handleSelectionChange]);

  // Mettre à jour les checkboxes lors du changement de mode
  useEffect(() => {
    if (editorRef.current) {
      // Forcer la mise à jour des styles des checkboxes
      applyBaseStyles();
      
      // Ajouter les event listeners pour les checkboxes
      const checkboxes = editorRef.current.querySelectorAll('input[type="checkbox"][data-checkbox-id]');
      const listeners: Array<{ element: HTMLInputElement; handler: () => void }> = [];
      
      checkboxes.forEach(checkbox => {
        const input = checkbox as HTMLInputElement;
        const handler = () => handleCheckboxChange(input);
        
        input.addEventListener('change', handler);
        listeners.push({ element: input, handler });
      });
      
      // Nettoyage des event listeners
      return () => {
        listeners.forEach(({ element, handler }) => {
          element.removeEventListener('change', handler);
        });
      };
    }
  }, [value, applyBaseStyles, handleCheckboxChange]);

  const toolbarButtons = [
    { icon: Bold, action: formatBold, title: 'Gras (Ctrl+B)', format: 'bold' },
    { icon: Italic, action: formatItalic, title: 'Italique (Ctrl+I)', format: 'italic' },
    { icon: Underline, action: formatUnderline, title: 'Souligné (Ctrl+U)', format: 'underline' },
    { icon: Code, action: formatCode, title: 'Code' },
    { type: 'divider' as const },
    { icon: Heading2, action: formatHeading2, title: 'Titre 2', format: 'h2' },
    { icon: Heading3, action: formatHeading3, title: 'Titre 3', format: 'h3' },
    { type: 'divider' as const },
    { icon: List, action: formatBulletList, title: 'Liste à puces', format: 'ul' },
    { icon: ListOrdered, action: formatNumberedList, title: 'Liste numérotée', format: 'ol' },
    { icon: CheckSquare, action: formatCheckbox, title: 'Case à cocher' },
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar - uniquement en mode édition */}
      <div className="flex-shrink-0 p-2 border-b border-amber-200 bg-amber-50/50 rounded-t-lg backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            {toolbarButtons.map((button, index) => {
              if (button.type === 'divider') {
                return <div key={index} className="h-6 w-px bg-amber-300/40 mx-1"></div>;
              }
              const IconComponent = button.icon;
              const isActive = button.format && activeFormats.has(button.format);
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`h-7 w-7 p-0 flex-shrink-0 transition-colors ${
                    isActive 
                      ? 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30' 
                      : 'hover:bg-amber-100/50 text-gray-500 hover:text-gray-700'
                  }`}
                  title={button.title}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </Button>
              );
            })}
          </div>
        </div>

      {/* Zone d'édition WYSIWYG */}
      <div className="flex-1 relative bg-amber-50 rounded-b-lg">
        <div
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onClick={handleEditorClick}
          className="absolute inset-0 p-4 focus:outline-none overflow-y-auto text-xs leading-relaxed rounded-b-lg"
          style={{ 
            color: '#374151',
            textAlign: 'left',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
          data-placeholder={placeholder}
        />
        
        {/* Placeholder quand vide */}
        {!value && (
          <div 
            className="absolute top-4 left-4 text-gray-400 pointer-events-none text-xs"
            style={{ zIndex: 1 }}
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
} 