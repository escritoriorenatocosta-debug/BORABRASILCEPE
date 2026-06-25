/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sticker, Slot, UserSticker } from '../types';
import { SLOTS, STICKERS } from '../data';
import { FOOTBALL_QUOTES } from '../quotes';
import StickerItem from './StickerItem';
import { playPeel, playGlue, playPageFlip, playRefuse } from '../audio';
import html2canvas from 'html2canvas';
import { 
  GripVertical, 
  HelpCircle, 
  ArrowRight, 
  CornerRightDown, 
  CheckCircle, 
  Download, 
  Printer, 
  Trash2, 
  Sparkles, 
  X, 
  RefreshCcw,
  ZoomIn,
  Lock,
  Unlock,
  Share2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Check
} from 'lucide-react';

const colorCache = new Map<string, string>();

function convertColorToRgba(cssColor: string): string {
  const trimmed = cssColor.trim();
  if (colorCache.has(trimmed)) {
    return colorCache.get(trimmed)!;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return trimmed;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = trimmed;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    const rgba = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3).replace(/\.?0+$/, '')})`;
    colorCache.set(trimmed, rgba);
    return rgba;
  } catch (err) {
    return trimmed;
  }
}

interface AlbumInsideProps {
  benchStickers: { sticker: Sticker; count: number }[];
  userStickers: UserSticker[];
  onGlueSticker: (stickerId: number, slotId: string) => void;
  onUnglueSticker: (stickerId: number, slotId: string) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  currentPageIndex: number;
  onPageIndexChange: (index: number) => void;
  onGoToMiniCraques?: () => void;
  onGoToBancada: () => void;
  initialSelectedStickerId?: number | null;
  onClearSelectedStickerFromBench?: () => void;
  isVersoCompleted?: boolean;
}

export default function AlbumInside({
  benchStickers,
  userStickers,
  onGlueSticker,
  onUnglueSticker,
  onPrevPage,
  onNextPage,
  currentPageIndex,
  onPageIndexChange,
  onGoToMiniCraques,
  onGoToBancada,
  initialSelectedStickerId,
  onClearSelectedStickerFromBench,
  isVersoCompleted
}: AlbumInsideProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getPageTitleLabel = (idx: number) => {
    if (idx >= 0 && idx <= 17) return `CONVOCADOS ${idx + 1}`;
    if (idx >= 18 && idx <= 35) return `ESPECIAIS ${idx - 17}`;
    if (idx === 38) return `EXTRA`;
    return `THE LEGENDS ${idx - 35}`;
  };

  // States for interaction and exports
  const [selectedStickerId, setSelectedStickerId] = useState<number | null>(null);

  React.useEffect(() => {
    if (initialSelectedStickerId !== undefined && initialSelectedStickerId !== null) {
      setSelectedStickerId(initialSelectedStickerId);
      if (onClearSelectedStickerFromBench) {
        onClearSelectedStickerFromBench();
      }
    }
  }, [initialSelectedStickerId, onClearSelectedStickerFromBench]);

  const [clickedSlotId, setClickedSlotId] = useState<string | null>(null);
  const [isControlsExpanded, setIsControlsExpanded] = useState<boolean>(true);

  // States for duplicate sticker block toast feedback
  const [showDuplicateToast, setShowDuplicateToast] = useState<boolean>(false);
  const [duplicateToastPos, setDuplicateToastPos] = useState<Slot | null>(null);
  const duplicateTimerRef = useRef<any>(null);

  // States for Auto Glue feedback overlay
  const [autoGlueCount, setAutoGlueCount] = useState<number | null>(null);
  const autoGlueTimerRef = useRef<any>(null);

  const triggerDuplicateFeedback = (slot: Slot) => {
    playRefuse();
    if (duplicateTimerRef.current) {
      clearTimeout(duplicateTimerRef.current);
    }
    setDuplicateToastPos(slot);
    setShowDuplicateToast(true);
    duplicateTimerRef.current = setTimeout(() => {
      setShowDuplicateToast(false);
      setDuplicateToastPos(null);
    }, 1800);
  };

  // Clean up duplicate timer on unmount
  useEffect(() => {
    return () => {
      if (duplicateTimerRef.current) {
        clearTimeout(duplicateTimerRef.current);
      }
      if (autoGlueTimerRef.current) {
        clearTimeout(autoGlueTimerRef.current);
      }
    };
  }, []);

  // macOS Dock Alignments: 'bottom' (horizontal, positioned above pages) or 'left' (vertical left)
  const [dockAlignment, setDockAlignment] = useState<'bottom' | 'left'>(() => {
    const saved = localStorage.getItem('sticker-dock-alignment');
    if (saved === 'left' || saved === 'bottom') return saved;
    return 'bottom';
  });

  useEffect(() => {
    localStorage.setItem('sticker-dock-alignment', dockAlignment);
  }, [dockAlignment]);

  // States for Click-and-Hold/Long-Press magnifying view
  const [zoomedSticker, setZoomedSticker] = useState<Sticker | null>(null);
  const [isEquipeZoomed, setIsEquipeZoomed] = useState(false);
  const [isZoomPersistent, setIsZoomPersistent] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [downloadNotification, setDownloadNotification] = useState(false);
  const zoomTimeoutRef = useRef<any>(null);

  const startZoomHold = (e: React.PointerEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, sticker: Sticker) => {
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }
    // Set to false by default because a press/hold is temporary
    setIsZoomPersistent(false);
    
    // Very fast & snappy responsive hold delay
    zoomTimeoutRef.current = setTimeout(() => {
      setZoomedSticker(sticker);
      playPeel();
    }, 200);
  };

  const endZoomHold = () => {
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
      zoomTimeoutRef.current = null;
    }
    // Only close on pointer lift if we're not in persistent click-to-zoom mode
    if (!isZoomPersistent) {
      setZoomedSticker(null);
    }
  };

  const triggerPersistentZoom = (sticker: Sticker) => {
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
      zoomTimeoutRef.current = null;
    }
    setIsZoomPersistent(true);
    setZoomedSticker(sticker);
    playPeel();
  };

  // Clean up zoom timeout on unmount
  useEffect(() => {
    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, []);

  // Global PointerUp release handler so hold-zoomed stickers never disappear unexpectedly while finger is still down
  useEffect(() => {
    const handleGlobalRelease = () => {
      if (zoomedSticker && !isZoomPersistent) {
        endZoomHold();
      }
    };

    window.addEventListener('mouseup', handleGlobalRelease, { passive: true });
    window.addEventListener('touchend', handleGlobalRelease, { passive: true });
    window.addEventListener('pointerup', handleGlobalRelease, { passive: true });

    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
      window.removeEventListener('pointerup', handleGlobalRelease);
    };
  }, [zoomedSticker, isZoomPersistent]);

  // Page completion checks
  const isPage1Completed = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].every(idx => {
    return userStickers.some(u => u.status === 'glued' && u.slotId === `BRA_${idx}`);
  });

  const isPage2Completed = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].every(idx => {
    return userStickers.some(u => u.status === 'glued' && u.slotId === `BRA_${idx}`);
  });

  const isPage3Completed = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].every(idx => {
    return userStickers.some(u => u.status === 'glued' && u.slotId === `BRA_${idx}`);
  });

  const isPage4Completed = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].every(idx => {
    return userStickers.some(u => u.status === 'glued' && u.slotId === `MC_${idx}`);
  });

  const isPage5Completed = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].every(idx => {
    return userStickers.some(u => u.status === 'glued' && u.slotId === `MC_${idx}`);
  });

  const isPage6Completed = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].every(idx => {
    return userStickers.some(u => u.status === 'glued' && u.slotId === `MC_${idx}`);
  });

  const isPage7Completed = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47].every(idx => {
    return userStickers.some(u => u.status === 'glued' && u.slotId === `BRA_${idx}`);
  });

  // Filter slots based on active page
  const activeSlots = SLOTS.filter(slot => {
    // CONVOCADOS (0 to 17)
    if (currentPageIndex >= 0 && currentPageIndex <= 17) {
      let minId = currentPageIndex * 12;
      let maxId = currentPageIndex * 12 + 11;
      
      // Handle the legacy page offset overrides because BRA_36-47 is Legends 1 and BRA_96-107 is Legends 2
      if (currentPageIndex === 3) { minId = 48; maxId = 59; }
      else if (currentPageIndex === 4) { minId = 60; maxId = 71; }
      else if (currentPageIndex === 5) { minId = 72; maxId = 83; }
      else if (currentPageIndex === 6) { minId = 84; maxId = 95; }
      else if (currentPageIndex >= 7) {
        minId = 108 + (currentPageIndex - 7) * 12;
        maxId = minId + 11;
      }
      
      const isCorrectBra = slot.id.startsWith("BRA_") && (() => {
        const num = parseInt(slot.id.split("_")[1]);
        return num >= minId && num <= maxId;
      })();
      
      const isCorrectSpc = (currentPageIndex === 0 && slot.id === "SPC_1") ||
                           (currentPageIndex === 1 && slot.id === "SPC_2") ||
                           (currentPageIndex === 2 && slot.id === "SPC_3");
                           
      return isCorrectBra || isCorrectSpc;
    }
    
    // ESPECIAIS / MINICRAQUES (18 to 35)
    if (currentPageIndex >= 18 && currentPageIndex <= 35) {
      const pageNum = currentPageIndex - 18; // 0 to 17
      const minId = pageNum * 12;
      const maxId = pageNum * 12 + 11;
      
      return slot.id.startsWith("MC_") && (() => {
        const num = parseInt(slot.id.split("_")[1]);
        return num >= minId && num <= maxId;
      })();
    }
    
    // THE LEGENDS (36 to 37)
    if (currentPageIndex >= 36 && currentPageIndex <= 37) {
      const pageNum = currentPageIndex - 36; // 0 to 1
      if (pageNum === 0) {
        return slot.id.startsWith("BRA_") && (() => {
          const num = parseInt(slot.id.split("_")[1]);
          return num >= 36 && num <= 47;
        })();
      } else {
        return slot.id.startsWith("BRA_") && (() => {
          const num = parseInt(slot.id.split("_")[1]);
          return num >= 96 && num <= 107;
        })();
      }
    }

    // EXTRA (38)
    if (currentPageIndex === 38) {
      return slot.id.startsWith("EXT_");
    }
    
    return false;
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // States for absolute pointer-dragging
  const [draggingSticker, setDraggingSticker] = useState<Sticker | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeHoveredSlot, setActiveHoveredSlot] = useState<string | null>(null);

  // Clean up dragging on pointer release
  useEffect(() => {
    const handleUp = () => {
      if (draggingSticker) {
        handleDragEnd();
      }
    };
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [draggingSticker, dragPosition]);

  // Start dragging a sticker from bench
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, sticker: Sticker) => {
    // DON'T prevent default here on touch to allow smoother scrolling/interaction 
    // unless definitely starting a drag. 
    // But since this is a DND setup, we might need it. Let's make it smarter.
    playPeel();
    setDraggingSticker(sticker);
    setSelectedStickerId(sticker.id);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragPosition({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
      setDragOffset({ x: 45, y: 70 }); 
    }
  };

  // Move drag handler
  const handleDragMove = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!draggingSticker || !containerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current.getBoundingClientRect();
    const xPos = clientX - rect.left;
    const yPos = clientY - rect.top;

    setDragPosition({ x: xPos, y: yPos });

    // Determine current hovering slot percentage values
    const xPct = (xPos / rect.width) * 100;
    const yPct = (yPos / rect.height) * 100;

    let hovered: string | null = null;
    activeSlots.forEach(slot => {
      const centerX = slot.left + slot.width / 2;
      const centerY = slot.top + slot.height / 2;
      const distance = Math.sqrt(Math.pow(xPct - centerX, 2) + Math.pow(yPct - centerY, 2));
      
      // Snap tolerance of ~8%
      if (distance < 7.5) {
        hovered = slot.id;
      }
    });

    setActiveHoveredSlot(hovered);
  };

  // End drag/Drop handler
  const handleDragEnd = () => {
    if (!draggingSticker || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (dragPosition.x / rect.width) * 100;
    const yPct = (dragPosition.y / rect.height) * 100;

    let snapped = false;

    activeSlots.forEach(slot => {
      const centerX = slot.left + slot.width / 2;
      const centerY = slot.top + slot.height / 2;
      const distance = Math.sqrt(Math.pow(xPct - centerX, 2) + Math.pow(yPct - centerY, 2));

      // Satisfies generic drop of any sticker to any tactical slot
      if (distance < 8.0) {
        // Validation check for correct slot matching
        if (draggingSticker.slotId !== slot.id) {
          return;
        }

        // Strict check to prevent gluing repeated/duplicate stickers anywhere in the entire album
        const isRepeatedGlued = userStickers.some(
          u => u.stickerId === draggingSticker.id && u.status === 'glued'
        );
        if (isRepeatedGlued) {
          triggerDuplicateFeedback(slot);
          return;
        }

        // Look up who is on this slot currently
        const currentOnSlot = userStickers.find(u => u.status === 'glued' && u.slotId === slot.id);
        if (currentOnSlot) {
          // Return the current one to bench first
          onUnglueSticker(currentOnSlot.stickerId, slot.id);
        }
        glueStickerAction(draggingSticker.id, slot.id);
        snapped = true;
      }
    });

    setDraggingSticker(null);
    setActiveHoveredSlot(null);
  };

  // Glue trigger action
  const glueStickerAction = (stickerId: number, slotId: string) => {
    playGlue();
    onGlueSticker(stickerId, slotId);
    if (selectedStickerId === stickerId) {
      setSelectedStickerId(null);
    }
  };

  // Slot click handler for non-drag interaction (Click sticker -> Click slot)
  const handleSlotClick = (slot: Slot) => {
    if (selectedStickerId === null) return;

    const selectedSticker = benchStickers.find(b => b.sticker.id === selectedStickerId)?.sticker;
    if (selectedSticker) {
      // Validation check for correct slot matching
      if (selectedSticker.slotId !== slot.id) {
        return;
      }

      // Strict check to prevent gluing repeated/duplicate stickers anywhere in the entire album
      const isRepeatedGlued = userStickers.some(
        u => u.stickerId === selectedStickerId && u.status === 'glued'
      );
      if (isRepeatedGlued) {
        triggerDuplicateFeedback(slot);
        return;
      }

      const currentOnSlot = userStickers.find(u => u.status === 'glued' && u.slotId === slot.id);
      if (currentOnSlot) {
        onUnglueSticker(currentOnSlot.stickerId, slot.id);
      }
      glueStickerAction(selectedStickerId, slot.id);
    }
  };

  // Auto Glue helper ("Auto-colar" helper across the entire album)
  const handleAutoLineup = () => {
    // Collect all unique available inventory stickers
    const available = benchStickers.map(b => ({ ...b }));
    if (available.length === 0) return;

    playGlue();

    let gluedCount = 0;
    const gluedOnRun = new Set<number>();

    // Iterate through all empty slots in the entire album (SLOTS)
    SLOTS.filter(s => s.id.startsWith("BRA_") || s.id.startsWith("MC_") || s.id.startsWith("SPC_")).forEach(slot => {
      const isOccupied = userStickers.some(u => u.status === 'glued' && u.slotId === slot.id);
      if (!isOccupied && available.length > 0) {
        // Find the sticker that belongs exactly to this slot
        const targetBundleIdx = available.findIndex(b => {
          const isAlreadyGlued = userStickers.some(u => u.stickerId === b.sticker.id && u.status === 'glued');
          const isGluedOnRun = gluedOnRun.has(b.sticker.id);
          const matchesThisSlot = b.sticker.slotId === slot.id;
          return !isAlreadyGlued && !isGluedOnRun && matchesThisSlot;
        });

        if (targetBundleIdx !== -1) {
          const targetBundle = available[targetBundleIdx];
          onGlueSticker(targetBundle.sticker.id, slot.id);
          gluedOnRun.add(targetBundle.sticker.id);
          gluedCount++;

          // Deduct count
          targetBundle.count -= 1;
          if (targetBundle.count <= 0) {
            available.splice(targetBundleIdx, 1);
          }
        }
      }
    });

    if (autoGlueTimerRef.current) {
      clearTimeout(autoGlueTimerRef.current);
    }
    setAutoGlueCount(gluedCount);
    autoGlueTimerRef.current = setTimeout(() => {
      setAutoGlueCount(null);
    }, 4000);
  };

  // Clear all players from the field entirely
  const handleClearField = () => {
    playPageFlip();
    const gluedOnPitch = userStickers.filter(u => u.status === 'glued' && u.slotId);
    gluedOnPitch.forEach(u => {
      if (u.slotId) onUnglueSticker(u.stickerId, u.slotId);
    });
  };

  // High quality html2canvas snapshot downloader
  const handleDownloadSpread = async () => {
    if (!containerRef.current) return;
    try {
      setIsExporting(true);
      setExportMessage('Registrando sua escalação oficial...');
      
      // Delay slightly for nice UI presentation
      await new Promise(resolve => setTimeout(resolve, 800));

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function(el, pseudoElt) {
        const style = originalGetComputedStyle.call(window, el, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            const val = target[prop as keyof CSSStyleDeclaration];
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              return convertColorToRgba(val);
            }
            return typeof val === 'function' ? (val as Function).bind(target) : val;
          }
        }) as CSSStyleDeclaration;
      };

      let canvas;
      try {
        canvas = await html2canvas(containerRef.current, {
          useCORS: true,
          allowTaint: true,
          scale: 2, // High resolution Retinal export
          backgroundColor: '#0c2417',
          logging: false,
          onclone: (clonedDoc) => {
            const clonedWindow = clonedDoc.defaultView;
            if (clonedWindow) {
              const iframeGetComputedStyle = clonedWindow.getComputedStyle;
              clonedWindow.getComputedStyle = function(el, pseudoElt) {
                const style = iframeGetComputedStyle.call(clonedWindow, el, pseudoElt);
                return new Proxy(style, {
                  get(target, prop) {
                    const val = target[prop as keyof CSSStyleDeclaration];
                    if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                      return convertColorToRgba(val);
                    }
                    return typeof val === 'function' ? (val as Function).bind(target) : val;
                  }
                }) as CSSStyleDeclaration;
              };
            }

            let combinedCss = '';
            try {
              const sheets = Array.from(document.styleSheets);
              for (const sheet of sheets) {
                try {
                  const rules = Array.from(sheet.cssRules || sheet.rules);
                  for (const rule of rules) {
                    combinedCss += rule.cssText + '\n';
                  }
                } catch (e) {
                  console.warn('Could not read style rules:', e);
                }
              }
            } catch (e) {
              console.warn('Could not read styleSheets:', e);
            }

            // Also collect from inline style elements in document
            const styleTags = Array.from(document.getElementsByTagName('style'));
            styleTags.forEach(style => {
              if (style.textContent) {
                combinedCss += style.textContent + '\n';
              }
            });

            // Fallback if combined is empty
            if (!combinedCss) {
              const clonedStyles = Array.from(clonedDoc.getElementsByTagName('style'));
              clonedStyles.forEach(style => {
                if (style.textContent) {
                  combinedCss += style.textContent + '\n';
                }
              });
            }

            // Convert oklch and oklab layout color schemes to standard browser-supported css hsla or rgba
            const processedCss = combinedCss
              .replace(/(oklch|oklab)\(([^)]+)\)/gi, (match) => {
                if (match.includes('var(')) {
                  return 'rgba(0,0,0,0)'; // prevent passing CSS vars down to the canvas filter
                }
                return convertColorToRgba(match);
              });

            // Remove all pre-existing stylesheets and styles from the cloned document to avoid html2canvas oklch crash
            const clonedLinks = Array.from(clonedDoc.getElementsByTagName('link'));
            clonedLinks.forEach(link => {
              if (link.rel === 'stylesheet' && link.href && !link.href.includes('fonts.googleapis.com')) {
                link.remove();
              }
            });
            const clonedStyles = Array.from(clonedDoc.getElementsByTagName('style'));
            clonedStyles.forEach(style => style.remove());

            // Create our processed clean stylesheet
            const styleEl = clonedDoc.createElement('style');
            styleEl.textContent = processedCss;
            clonedDoc.head.appendChild(styleEl);
          }
        });
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
      }

      const url = canvas.toDataURL('image/png');
      const filename = `Escalacao-BoraBrasil-CEPE-${new Date().toISOString().slice(0, 10)}.png`;
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      
      setExportMessage('Prontinho! Seus colaboradores foram escalados.');
      setTimeout(() => setExportMessage(''), 3000);
    } catch (e) {
      console.warn('Screenshot download error:', e);
      setExportMessage('Falha ao exportar. Tente imprimir por PDF!');
      setTimeout(() => setExportMessage(''), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  // Window browser print handler
  const handlePrintSpread = () => {
    window.print();
  };

  // Filter out which sticker object is assigned to this slot (by ID matching)
  const getGluedStickerOnSlot = (slotId: string): Sticker | null => {
    if (slotId === 'SPC_1') {
      const isAwarded = isPage1Completed || localStorage.getItem('cepe_celebrated_page1') === 'true' || userStickers.some(u => u.stickerId === 201 && u.status === 'glued');
      return isAwarded ? STICKERS.find(s => s.id === 201) || null : null;
    }
    if (slotId === 'SPC_2') {
      const isAwarded = isPage2Completed || localStorage.getItem('cepe_celebrated_page2') === 'true' || userStickers.some(u => u.stickerId === 202 && u.status === 'glued');
      return isAwarded ? STICKERS.find(s => s.id === 202) || null : null;
    }
    if (slotId === 'SPC_3') {
      const isAwarded = isPage3Completed || localStorage.getItem('cepe_celebrated_page3') === 'true' || userStickers.some(u => u.stickerId === 203 && u.status === 'glued');
      return isAwarded ? STICKERS.find(s => s.id === 203) || null : null;
    }
    if (slotId === 'SPC_4') {
      const isAwarded = isVersoCompleted || localStorage.getItem('cepe_celebrated_page4') === 'true' || userStickers.some(u => u.stickerId === 204 && u.status === 'glued');
      return isAwarded ? STICKERS.find(s => s.id === 204) || null : null;
    }
    if (slotId === 'SPC_5') {
      const spc5Awarded = localStorage.getItem('cepe_has_celebrated_full_completion_v1') === 'true' || userStickers.some(u => u.stickerId === 205 && u.status === 'glued');
      if (spc5Awarded) return STICKERS.find(s => s.id === 205) || null;

      const isProgressSlot = (slotId?: string): boolean => {
        if (!slotId) return false;
        if (slotId.startsWith("BRA_")) {
          return true;
        }
        return ["EXT_0", "EXT_1", "EXT_2"].includes(slotId);
      };

      const coreGluedCount = new Set(
        userStickers
          .filter(u => u.status === 'glued' && isProgressSlot(u.slotId))
          .map(u => u.stickerId)
      ).size;
      const totalRequired = 243;
      return coreGluedCount >= totalRequired ? STICKERS.find(s => s.id === 205) || null : null;
    }
    const record = userStickers.find(u => u.status === 'glued' && u.slotId === slotId);
    if (!record) return null;
    return STICKERS.find(s => s.id === record.stickerId) || null;
  };

  const activeSelectedSticker = selectedStickerId 
    ? benchStickers.find(b => b.sticker.id === selectedStickerId)?.sticker 
    : null;

  return (
    <div 
      className="w-full flex flex-col gap-6 select-none animate-fade-in transition-all duration-500 ease-in-out" 
      onMouseMove={handleDragMove} 
      onTouchMove={handleDragMove} 
      onClick={() => setClickedSlotId(null)}
    >
      
      {/* EXPORT OVERLAY MESSAGE BANNER */}
      {exportMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-900 border-2 border-yellow-400 text-yellow-100 font-sans font-bold text-xs px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-scale-in">
          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span>{exportMessage}</span>
        </div>
      )}      {/* CORE COACH CONTROL CONSOLE BAR & PAGES PANEL - PREMIUM FLAT MODERN DESIGN */}
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 print:hidden z-25 px-2 sm:px-16" id="album-tactical-controls-wrapper">
        {isControlsExpanded && (
          <>
            {/* PAGE TOGGLER - DESIGN FOR 32 COMPREHENSIVE PAGES (Categorized and Fluid) */}
            <div 
              data-html2canvas-ignore="true" 
              style={{ backgroundColor: '#ffffff' }}
              className="w-full border-4 border-slate-950 rounded-[32px] p-5 flex flex-col items-center justify-center gap-4 shadow-lg"
            >
              {/* Derived category status */}
              {(() => {
                const currentCategory = currentPageIndex === 38 ? 'extra' : currentPageIndex >= 36 ? 'legends' : currentPageIndex >= 18 ? 'especiais' : 'convocados';

                const getConvocadosPageCount = (p: number) => {
                  let minId = p * 12;
                  let maxId = p * 12 + 11;
                  // Handle the legacy gaps because BRA_36-47 is Legends 1 and BRA_96-107 is Legends 2
                  if (p === 3) { minId = 48; maxId = 59; }
                  else if (p === 4) { minId = 60; maxId = 71; }
                  else if (p === 5) { minId = 72; maxId = 83; }
                  else if (p === 6) { minId = 84; maxId = 95; }
                  else if (p >= 7) {
                    minId = 108 + (p - 7) * 12;
                    maxId = minId + 11;
                  }
                  return userStickers.filter(u => u.status === 'glued' && u.slotId.startsWith("BRA_") && (() => {
                    const idx = parseInt(u.slotId.split("_")[1]);
                    return idx >= minId && idx <= maxId;
                  })()).length;
                };

                const getEspeciaisPageCount = (p: number) => {
                  const minId = p * 12;
                  const maxId = p * 12 + 11;
                  return userStickers.filter(u => u.status === 'glued' && u.slotId.startsWith("MC_") && (() => {
                    const idx = parseInt(u.slotId.split("_")[1]);
                    return idx >= minId && idx <= maxId;
                  })()).length;
                };

                const getLegendsPageCount = (p: number) => {
                  const pageOffset = p === 0 ? [36, 47] : [96, 107];
                  return userStickers.filter(u => u.status === 'glued' && u.slotId.startsWith("BRA_") && (() => {
                    const idx = parseInt(u.slotId.split("_")[1]);
                    return idx >= pageOffset[0] && idx <= pageOffset[1];
                  })()).length;
                };

                const getExtraPageCount = () => {
                  return userStickers.filter(u => u.status === 'glued' && u.slotId.startsWith("EXT_")).length;
                };

                return (
                  <div className="w-full flex flex-col gap-4">
                    {/* Row 1: Main Category Selection */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center pb-3 border-b-2 border-slate-100">
                      <div className="flex items-center gap-2.5 flex-wrap justify-center">
                        <button
                          onClick={() => {
                            if (currentCategory !== 'convocados') {
                              playPageFlip();
                              onPageIndexChange(0);
                            }
                          }}
                          style={currentCategory === 'convocados' ? { backgroundColor: '#7b2e98' } : undefined}
                          className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                            currentCategory === 'convocados'
                              ? 'text-white font-black'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-800'
                          }`}
                        >
                          <span className="font-extrabold uppercase text-[11px] tracking-wider">CONVOCADOS (PÁG 1-18)</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            if (currentCategory !== 'especiais') {
                              playPageFlip();
                              onPageIndexChange(18);
                            }
                          }}
                          style={currentCategory === 'especiais' ? { backgroundColor: '#db2777' } : undefined}
                          className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                            currentCategory === 'especiais'
                              ? 'text-white font-black'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-800'
                          }`}
                        >
                          <span className="font-extrabold uppercase text-[11px] tracking-wider">ESPECIAIS (PÁG 1-18)</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            if (currentCategory !== 'legends') {
                              playPageFlip();
                              onPageIndexChange(36);
                            }
                          }}
                          style={currentCategory === 'legends' ? { backgroundColor: '#cca800' } : undefined}
                          className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                            currentCategory === 'legends'
                              ? 'text-white font-black border-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-800'
                          }`}
                        >
                          <span className="font-extrabold uppercase text-[11px] tracking-wider">🏆 THE LEGENDS</span>
                        </button>

                        <button
                          onClick={() => {
                            if (currentCategory !== 'extra') {
                              playPageFlip();
                              onPageIndexChange(38);
                            }
                          }}
                          style={currentCategory === 'extra' ? { backgroundColor: '#10b981' } : undefined}
                          className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                            currentCategory === 'extra'
                              ? 'text-white font-black border-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-800'
                          }`}
                        >
                          <span className="font-extrabold uppercase text-[11px] tracking-wider">📦 EXTRA</span>
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Sub-pages Section inside Active Category */}
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full justify-center">
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        {currentCategory === 'convocados' && Array.from({ length: 18 }).map((_, i) => {
                          const isSelected = currentPageIndex === i;
                          const count = getConvocadosPageCount(i);
                          const isCompleted = count === 12;
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                  if (currentPageIndex !== i) {
                                    playPageFlip();
                                    onPageIndexChange(i);
                                  }
                              }}
                              style={isSelected ? { backgroundColor: '#7b2e98' } : undefined}
                              className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border-2 border-slate-950 shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none relative ${
                                isSelected
                                  ? 'text-white font-black'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border-slate-200'
                              }`}
                            >
                              <span>Pág {i + 1}</span>
                              <span className={`font-mono text-[9px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/30 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                {count}/12
                              </span>
                              {isCompleted && (
                                <div 
                                  className="absolute -top-2 -right-2 text-white rounded-full px-1.5 py-0.5 border border-slate-950 z-20 shadow text-[8px] font-black tracking-tight shrink-0 flex items-center justify-center gap-0.5"
                                  style={{ backgroundColor: '#ff00ff' }}
                                  title="Página Completada! ✓ OK"
                                >
                                  <Check className="w-2 h-2 stroke-[5]" />
                                  <span>OK</span>
                                </div>
                              )}
                            </button>
                          );
                        })}

                        {currentCategory === 'especiais' && Array.from({ length: 18 }).map((_, i) => {
                          const targetIdx = 18 + i;
                          const isSelected = currentPageIndex === targetIdx;
                          const count = getEspeciaisPageCount(i);
                          const isCompleted = count === 12;
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                if (currentPageIndex !== targetIdx) {
                                  playPageFlip();
                                  onPageIndexChange(targetIdx);
                                }
                              }}
                              style={isSelected ? { backgroundColor: '#db2777' } : undefined}
                              className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border-2 border-slate-950 shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none relative ${
                                isSelected
                                  ? 'text-white font-black'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border-slate-200'
                              }`}
                            >
                              <span>Pág {i + 1}</span>
                              <span className={`font-mono text-[9px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/30 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                {count}/12
                              </span>
                              {isCompleted && (
                                <div 
                                  className="absolute -top-2 -right-2 text-white rounded-full px-1.5 py-0.5 border border-slate-950 z-20 shadow text-[8px] font-black tracking-tight shrink-0 flex items-center justify-center gap-0.5"
                                  style={{ backgroundColor: '#ff00ff' }}
                                  title="Página Completada! ✓ OK"
                                >
                                  <Check className="w-2 h-2 stroke-[5]" />
                                  <span>OK</span>
                                </div>
                              )}
                            </button>
                          );
                        })}

                        {currentCategory === 'legends' && Array.from({ length: 2 }).map((_, i) => {
                          const targetIdx = 36 + i;
                          const isSelected = currentPageIndex === targetIdx;
                          const count = getLegendsPageCount(i);
                          const isCompleted = count === 12;
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                if (currentPageIndex !== targetIdx) {
                                  playPageFlip();
                                  onPageIndexChange(targetIdx);
                                }
                              }}
                              style={isSelected ? { backgroundColor: '#cca800' } : undefined}
                              className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border-2 border-slate-950 shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none relative ${
                                isSelected
                                  ? 'text-white font-black'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border-slate-200'
                              }`}
                            >
                              <span>Pág {i + 1}</span>
                              <span className={`font-mono text-[9px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/30 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                {count}/12
                              </span>
                              {isCompleted && (
                                <div 
                                  className="absolute -top-2 -right-2 text-white rounded-full px-1.5 py-0.5 border border-slate-950 z-20 shadow text-[8px] font-black tracking-tight shrink-0 flex items-center justify-center gap-0.5"
                                  style={{ backgroundColor: '#ff00ff' }}
                                  title="Página Completada! ✓ OK"
                                >
                                  <Check className="w-2 h-2 stroke-[5]" />
                                  <span>OK</span>
                                </div>
                              )}
                            </button>
                          );
                        })}

                        {currentCategory === 'extra' && (() => {
                          const count = getExtraPageCount();
                          const isCompleted = count === 6;
                          return (
                            <button
                              onClick={() => {
                                if (currentPageIndex !== 38) {
                                  playPageFlip();
                                  onPageIndexChange(38);
                                }
                              }}
                              style={{ backgroundColor: '#10b981' }}
                              className="px-3 py-1.5 rounded-full font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border-2 border-slate-950 shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none text-white font-black relative"
                            >
                              <span>ÚNICA</span>
                              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-full bg-black/30 text-white">
                                {count}/6
                              </span>
                              {isCompleted && (
                                <div 
                                  className="absolute -top-2 -right-2 text-white rounded-full px-1.5 py-0.5 border border-slate-950 z-20 shadow text-[8px] font-black tracking-tight shrink-0 flex items-center justify-center gap-0.5"
                                  style={{ backgroundColor: '#ff00ff' }}
                                  title="Página Completada! ✓ OK"
                                >
                                  <Check className="w-2 h-2 stroke-[5]" />
                                  <span>OK</span>
                                </div>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div 
              style={{ backgroundColor: '#7b2e98', height: '60px' }}
              className="w-full border-4 border-slate-950 rounded-full px-4 sm:px-6 shadow-xl flex flex-row items-center justify-between gap-2 z-20"
            >
              <div className="flex flex-row items-center font-sans">
                <div className="flex items-center gap-2">
                  <span 
                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                    className="text-[10px] font-black uppercase px-3 py-1 rounded-full select-none shadow border-2 border-slate-950 tracking-wider"
                  >
                    AUTO-TÁTICO
                  </span>
                </div>
              </div>

              {/* Tactical Buttons - Extremely rounded-full and flat borders */}
              <div className="flex items-center justify-center md:justify-end flex-wrap gap-2.5 shrink-0 font-sans">
                {benchStickers.length > 0 && (
                  <button 
                    onClick={handleAutoLineup}
                    title="Colar todas as figurinhas que você possuir no inventário nas posições livres do álbum"
                    className="px-4 py-2 bg-[#FFDF1B] hover:bg-[#ffe535] text-slate-950 border-2 border-slate-950 font-black text-xs rounded-full shadow-[2px_2px_0_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <span>AUTO-COLAR</span>
                  </button>
                )}


              </div>
            </div>
          </>
        )}

        {/* CONTROLS COLLAPSE/EXPAND TRIGGER BUTTON */}
        <div className={`flex flex-col items-center justify-center print:hidden z-30 ${isControlsExpanded ? '-mt-8' : '-mt-2'}`} id="collapse-controls-wrapper">
          {!isControlsExpanded && (
            <div className="w-[85%] sm:w-[540px] h-[5px] bg-black rounded-full" />
          )}
          <button
            onClick={() => {
              playPageFlip();
              setIsControlsExpanded(!isControlsExpanded);
            }}
            style={{
              paddingBottom: '4px',
              marginLeft: '0px',
              marginRight: '0px',
              marginTop: isControlsExpanded ? '12px' : '-2px',
              marginBottom: '-12px',
              height: '30px',
              backgroundColor: '#000000',
              borderWidth: '0px',
              fontSize: '10px',
              textAlign: 'left'
            }}
            className="backdrop-blur-sm text-white px-6 rounded-b-full transition-all hover:bg-zinc-900 cursor-pointer flex items-center justify-center min-w-[70px]"
            id="toggle-controls-btn"
            title={isControlsExpanded ? "Recolher Controles" : "Expandir Controles"}
          >
            {isControlsExpanded ? (
              <ChevronUp 
                className="text-white" 
                style={{
                  width: '60px',
                  height: '20px',
                  marginLeft: '9px',
                  color: '#ffffff'
                }}
              />
            ) : (
              <div className="w-6 h-0.5 bg-white rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Pages Container Wrapper with Outside Navigation Arrows */}
      <div className="relative w-full max-w-5xl mx-auto px-2 sm:px-16 print:px-0 flex items-center justify-center">
        {/* Left Arrow Button (StickerBench styling, completely outside / visible) */}
        <button
          onClick={() => {
            if (currentPageIndex > 0) {
              playPageFlip();
              onPageIndexChange(currentPageIndex - 1);
            } else {
              onPrevPage();
            }
          }}
          data-html2canvas-ignore="true"
          className="absolute left-0.5 sm:left-2 z-30 bg-slate-950 hover:bg-slate-900 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border-2 border-slate-950 hover:scale-105 active:scale-95 focus:outline-none print:hidden cursor-pointer"
          style={{
            width: '36px',
            height: '36px',
            padding: '0px',
          }}
          aria-label={currentPageIndex > 0 ? "Voltar Página" : "Voltar para a Capa"}
        >
          <ChevronLeft className="w-5 h-5 stroke-[3.5] text-white" />
        </button>

        {/* Inner pitch spread */}
        <div 
          ref={containerRef} 
          id="album-pitch-spread" 
          style={{ borderColor: '#f8f8f8', backgroundColor: '#010101' }}
          className="relative w-full aspect-[1414/934] shadow-2xl rounded-2xl overflow-hidden border-4 border-emerald-900 bg-emerald-950 print:border-0 print:shadow-none print:rounded-none"
        >
        
        {/* Dual Page Spread Album Image */}
        <img
          src={currentPageIndex === 38 ? "/assets/images/PAGINA__EXTRA.png" : currentPageIndex >= 36 ? "/assets/images/PAGINA_legends.png" : (currentPageIndex >= 18) ? "/assets/images/PAGINA3.png" : "/assets/images/PAGINA1.png"}
          alt="Álbum Bora Brasil Aberto"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const currentSrc = e.currentTarget.src;
            if (currentSrc.includes('/assets/images/')) {
              e.currentTarget.src = currentPageIndex === 38 ? '/PAGINA__EXTRA.png' : currentPageIndex >= 36 ? '/PAGINA_legends.png' : (currentPageIndex >= 18) ? '/PAGINA3.png' : '/PAGINA1.png';
            }
          }}
          className="w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Floating spine crease shade */}
        <div className="absolute inset-y-0 left-[49.7%] w-1 sm:w-2 bg-gradient-to-r from-black/30 via-black/50 to-black/30 pointer-events-none z-10 print:hidden" />

        {/* Lupa zoom button for page 39 (extra) team photo */}
        {currentPageIndex === 38 && (
          <button
            onClick={() => setIsEquipeZoomed(true)}
            title="Clique para ampliar a foto da equipe completa!"
            className="absolute z-30 group cursor-pointer flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              left: '88%',
              bottom: '5.5%',
              width: '8%',
              height: '10%',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              padding: 0
            }}
          >
            {/* Glowing yellow outline */}
            <div 
              className="absolute inset-0 border-2 border-dashed rounded-lg opacity-30 group-hover:opacity-100 transition-all duration-300 animate-pulse" 
              style={{ borderColor: '#ffffff' }}
            />
            
            {/* Floating Zoom icon with background */}
            <div 
              className="relative bg-slate-950/80 hover:bg-slate-950 rounded-full shadow-lg transition-all duration-300 transform group-hover:rotate-12 border-2 flex items-center justify-center"
              style={{ width: '40px', height: '40px', borderColor: '#ffffff', color: '#ffffff' }}
            >
              <ZoomIn className="w-5 h-5" style={{ color: '#ffffff' }} />
            </div>
          </button>
        )}

        {/* Render Page Field Slots */}
        {activeSlots.map((slot, index) => {
          // Check if there is an active glued sticker at this specific slot
          const gluedSticker = getGluedStickerOnSlot(slot.id);

          const belongsToThisSlot = activeSelectedSticker && activeSelectedSticker.slotId === slot.id;
          const isTargetedByDrag = draggingSticker; // Any sticker is dynamic/glow candidate
          const isCurrentlyHovered = activeHoveredSlot === slot.id;

          const isGlued = !!gluedSticker;
          const isSpecial = slot.id.startsWith('SPC_');

          // Highlight rule: if we clicked or are dragging a sticker, only glow the correct specific slot
          const currentTargetSticker = draggingSticker || activeSelectedSticker;
          const shouldSlotGlow = currentTargetSticker ? currentTargetSticker.slotId === slot.id : false;

          return (
            <div
              key={slot.id}
              className={`absolute transition-all duration-300 ${
                isGlued ? 'z-10' : 'cursor-pointer hover:scale-101'
              }`}
              style={{
                left: `${slot.left}%`,
                top: `${slot.top}%`,
                width: `${slot.width}%`,
                height: `${slot.height}%`,
                borderRadius: index === 11 ? '6px' : '2px',
                overflow: 'visible'
              }}
              onClick={() => {
                if (!isSpecial) {
                  handleSlotClick(slot);
                }
              }}
            >
              {isGlued && gluedSticker ? (
                /* Dynamic Glued Player Sticker inside customizable Slot with click-and-hold magnifying view */
                <div 
                   className="w-full h-full relative group cursor-pointer"
                  style={{ borderRadius: index === 11 ? '6px' : '2px', overflow: 'hidden' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setClickedSlotId(clickedSlotId === slot.id ? null : slot.id);
                  }}
                  onPointerDown={(e) => startZoomHold(e, gluedSticker)}
                  onPointerUp={endZoomHold}
                  onTouchStart={(e) => {
                    startZoomHold(e, gluedSticker);
                  }}
                  onTouchEnd={endZoomHold}
                >
                  <StickerItem
                    sticker={gluedSticker}
                    size="lg"
                    isGlued={true}
                    className="w-full h-full border"
                    style={{ borderRadius: index === 11 ? '6px' : '2px' }}
                    customRole={slot.label}
                  />
                  
                  {/* ON-HOVER / ON-CLICK EXTRA CONTROL BADGES (Hidden during screenshot) */}
                  <div 
                    data-html2canvas-ignore="true"
                    className={`absolute inset-0 flex items-center justify-center gap-1.5 sm:gap-2 z-30 bg-slate-950/60 rounded-[inherit] print:hidden transition-all duration-200 ${
                      clickedSlotId === slot.id
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
                    }`}
                  >
                    {/* Zoom / Magnify persistent button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerPersistentZoom(gluedSticker);
                      }}
                      title="Ampliar"
                      className="bg-[#120524] hover:bg-yellow-400 text-white hover:text-slate-950 w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer border border-yellow-400/30"
                    >
                      <ZoomIn className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                    </button>
                  </div>

                  {/* Little field position watermark label on the glued sticker representing current tactical duty */}
                  <div className="absolute bottom-1 right-1 bg-emerald-950/70 border border-emerald-500/30 text-[6px] tracking-wider uppercase px-1 py-0.5 rounded text-yellow-300 font-mono scale-[0.85] z-10 pointer-events-none font-bold">
                    {slot.label.split(' ')[0]} {/* brief label */}
                  </div>
                </div>
              ) : isSpecial ? (
                /* Render Gorgeous Locked Special Achievement Slot! */
                <div 
                   className="w-full h-full flex flex-col justify-center items-center border-2 border-dashed border-yellow-500/40 bg-yellow-950/40 text-center p-1 relative select-none"
                  style={{ borderRadius: index === 11 ? '6px' : '2px' }}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span 
                      style={{ fontFamily: 'system-ui' }}
                      className="text-[5.5px] sm:text-[7.5px] md:text-[9.5px] font-black text-yellow-300 tracking-tight uppercase leading-tight"
                    >
                      CROMO ESPECIAL
                    </span>
                    <p className="text-[4.5px] sm:text-[6px] md:text-[7.5px] font-sans font-semibold text-yellow-100/60 leading-none mt-0.5">
                      COMPLETE SUA SELEÇÃO
                    </p>
                  </div>
                </div>
              ) : (
                /* Empty Position Indicator - with gorgeous tactical hover glows */
                <div
                  style={{
                    borderRadius: index === 11 ? '6px' : '2px'
                  }}
                  className={`
                    w-full h-full flex flex-col justify-center items-center
                    transition-all duration-300 relative bg-black/25 text-center p-1
                    ${shouldSlotGlow
                      ? 'border-[#FFDF1B] border-4 border-dashed bg-yellow-400/10 scale-102 animate-pulse shadow-[0_0_25px_rgba(255,223,27,0.6)]' 
                      : 'border-2 border-dashed border-emerald-700/60 hover:bg-emerald-800/10 hover:border-emerald-600'}
                    ${isCurrentlyHovered ? 'bg-yellow-400/25 scale-105 border-double border-4' : ''}
                  `}
                >
                  <span 
                    style={{ 
                      fontFamily: 'system-ui',
                      fontSize: '9px',
                      lineHeight: '16px',
                      color: shouldSlotGlow ? '#ffffff' : '#dcdcdc',
                      fontStyle: 'normal',
                      fontWeight: 'bold',
                      paddingTop: '0px',
                      opacity: shouldSlotGlow ? 0.3 : 1
                    }}
                    className="font-bold tracking-tighter uppercase select-none font-sans"
                  >
                    {slot.label}
                  </span>
                  
                  {/* Guided glowing beacon when dragging/selecting */}
                  {(shouldSlotGlow) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-400/5 pointer-events-none z-20">
                      {/* High-definition premium dark circular plus button equivalent to client attachment mockup */}
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-950 border-2 border-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.85)] flex items-center justify-center overflow-hidden">
                        {/* Subtly glossy overlay background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black z-0" />
                        <div className="absolute inset-x-0 top-0 h-[45%] bg-white/5 rounded-t-full z-10" />
                        <span className="relative text-2xl sm:text-3xl font-bold leading-none -mt-0.5 select-none text-white z-20">+</span>
                      </div>
                      <span className="text-[8px] sm:text-[9.5px] font-sans font-black text-white bg-black/75 px-1.5 py-0.5 rounded tracking-widest mt-1.5 shadow-sm border border-white/10 uppercase select-none animate-bounce">
                        COLAR AQUI
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Floating duplicate prevented warning toast positioned right on top of the target slot */}
        {showDuplicateToast && duplicateToastPos && (
          <div 
            style={{
              left: `${duplicateToastPos.left + duplicateToastPos.width / 2}%`,
              top: `${duplicateToastPos.top + duplicateToastPos.height / 2}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#db2777',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.7)',
              borderWidth: '2px',
              borderColor: '#ffffff',
              color: '#ffffff'
            }}
            className="absolute z-50 font-black text-[10px] sm:text-xs tracking-widest uppercase py-1 px-3 rounded-md flex items-center justify-center select-none animate-bounce"
          >
            REPETIDA
          </div>
        )}

        {/* Absolute layer render of dragged sticker floating with mouse */}
        {draggingSticker && containerRef.current && (
          <div
            className="fixed pointer-events-none select-none z-50 transform pointer-events-none"
            style={{
              left: `${dragPosition.x + containerRef.current.getBoundingClientRect().left - dragOffset.x}px`,
              top: `${dragPosition.y + containerRef.current.getBoundingClientRect().top - dragOffset.y}px`
            }}
          >
            <StickerItem sticker={draggingSticker} size="md" className="shadow-2xl scale-105 rotate-[-3deg]" />
          </div>
        )}

             {/* Precise, robust zoom sticker overlay with multi-mode exit triggers */}
        {zoomedSticker && createPortal((() => {
          const gluedMatch = userStickers.find(u => u.stickerId === zoomedSticker.id && u.status === 'glued');
          const slot = gluedMatch ? SLOTS.find(s => s.id === gluedMatch.slotId) : null;
          const rawRole = slot ? slot.label : zoomedSticker.role;
          
          const labelUpper = rawRole.toUpperCase();
          let pName = 'ATACANTE';
          if (labelUpper.includes('GOLEIRO') || labelUpper.includes('GOLEIRA')) pName = 'GOLEIRO';
          else if (labelUpper.includes('LATERAL DIREITO')) pName = 'LATERAL DIREITO';
          else if (labelUpper.includes('LATERAL ESQUERDO')) pName = 'LATERAL ESQUERDO';
          else if (labelUpper.includes('ZAGUEIRO') || labelUpper.includes('ZAGUEIRA')) pName = 'ZAGUEIRO';
          else if (labelUpper.includes('VOLANTE')) pName = 'VOLANTE';
          else if (labelUpper.includes('ARMADOR') || labelUpper.includes('MEIO-CAMPO') || labelUpper.includes('MEIA')) pName = 'MEIO-CAMPO';
          else if (labelUpper.includes('TÉCNICO')) pName = 'TÉCNICO';
          else if (labelUpper.includes('CROMO') || labelUpper.includes('ESPECIAL')) pName = 'ESPECIAL';

          // Detailed info generation for soccer card stats
          const birthDates = [
            "12-04-1992", "03-09-1995", "30-10-1960", "22-07-1988", "15-11-1996",
            "08-01-2001", "17-06-1994", "25-05-1991", "04-02-1989", "19-12-1993",
            "11-08-1990", "21-09-2015", "12-04-1992", "03-09-1995", "30-10-1960",
            "22-07-1988", "15-11-1996", "08-01-2001", "17-06-1994", "25-05-1991",
            "04-02-1989", "19-12-1993", "11-08-1990", "21-09-2015", "07-09-1822", "15-11-1889"
          ];
          
          const heights = [
            "1.82 m", "1.74 m", "1.65 m", "1.88 m", "1.79 m",
            "1.68 m", "1.85 m", "1.72 m", "1.80 m", "1.76 m",
            "1.81 m", "1.30 m", "1.81 m", "1.74 m", "1.65 m",
            "1.88 m", "1.79 m", "1.68 m", "1.85 m", "1.72 m",
            "1.80 m", "1.76 m", "1.81 m", "1.30 m", "1.80 m", "1.72 m"
          ];

          const weights = [
            "78 kg", "68 kg", "70 kg", "85 kg", "74 kg",
            "59 kg", "81 kg", "72 kg", "77 kg", "71 kg",
            "79 kg", "32 kg", "78 kg", "68 kg", "70 kg",
            "85 kg", "74 kg", "59 kg", "81 kg", "72 kg",
            "77 kg", "71 kg", "79 kg", "32 kg", "80 kg", "73 kg"
          ];

          const idx = (zoomedSticker.id - 1) % 26;
          const isSpecial = zoomedSticker.id >= 201 && zoomedSticker.id <= 204;
          const isLegend = (zoomedSticker.id >= 37 && zoomedSticker.id <= 48) || (zoomedSticker.id >= 301 && zoomedSticker.id <= 312);
          const targetSlot = SLOTS.find(s => s.id === zoomedSticker.slotId);
          const legendLabel = targetSlot ? targetSlot.label : zoomedSticker.role;

          let posName = '';
          if (slot) {
            // Se estiver adicionado em algum campo, puxa o label do local (ex: goleiro, atacante...)
            const cleanLabel = slot.label.replace(/\s*II?$/i, '');
            if (cleanLabel === "Goleira/Goleiro") posName = "Goleiro";
            else if (cleanLabel === "Zagueira/Zagueiro") posName = "Zagueiro";
            else posName = cleanLabel;
          } else {
            posName = zoomedSticker.role;
            if (zoomedSticker.role === "Editora") posName = "Ponta Esquerda";
            else if (zoomedSticker.role === "Revista") posName = "Meio-campista";
            else if (zoomedSticker.role === "Informática") posName = "Goleiro de Redes";
            else if (zoomedSticker.role === "Sumid") posName = "Zagueiro Central";
            else if (zoomedSticker.role === "Comercial") posName = "Lateral Direito";
            else if (zoomedSticker.role === "Direção") posName = "Técnico";
            if (isSpecial) posName = "Cromo Lendário";
          }

          const birthDate = birthDates[idx] || "15-05-1994";
          const height = heights[idx] || "1.75 m";
          const weight = weights[idx] || "72 kg";
          const clubName = isSpecial ? "Clube Lendário CEPE" : "Companhia Editora de Pernambuco (CEPE)";

          return (
            <div 
              className="fixed inset-0 bg-[#280436]/90 z-[200] flex items-center justify-center p-4 overflow-y-auto select-none animate-fade-in cursor-pointer"
              data-html2canvas-ignore="true"
              onClick={() => {
                setZoomedSticker(null);
                setIsZoomPersistent(false);
              }}
            >
              <div 
                className="w-full max-w-2xl flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center py-6 cursor-default transform animate-scale-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Premium card display block rotate/tilt effect */}
                <div 
                  style={{ backgroundColor: '#9900fc', backgroundImage: 'none' }}
                  className="relative w-48 aspect-[3/4] sm:w-56 p-2 rounded-[24px] border-6 border-slate-950 shadow-[12px_12px_0_rgba(15,10,25,1)] hover:rotate-2 transition-transform duration-350 flex flex-col items-center justify-between overflow-hidden group select-none ring-4 ring-[#FFDF1B]/30"
                >
                  <span className="sr-only" style={{ color: '#ffffff' }}>★</span>
                  <div className="absolute inset-1.5 border-2 border-dashed border-[#FFDF1B]/15 rounded-[18px] pointer-events-none" />
                  
                  {/* Shiny Star seal of authenticity */}
                  <div className="absolute top-3 left-3 text-[10px] bg-[#FFDF1B] text-slate-900 border border-slate-950 rounded-full w-6 h-6 flex items-center justify-center font-black z-20">
                    ★
                  </div>

                  <div className="w-full h-full relative bg-slate-950 border-3 border-slate-950 rounded-xl overflow-hidden shadow-inner font-sans">
                    <StickerItem
                      sticker={zoomedSticker}
                      size="lg"
                      isGlued={true}
                      customRole={posName}
                      className="w-full h-full border-0 shadow-none hover:scale-100 hover:translate-y-0"
                    />
                  </div>
                </div>

                {/* Right side: Information block with outer button below it */}
                <div className="w-full max-w-xs flex flex-col gap-4">
                  {/* Green or Gold box information block */}
                  <div 
                    style={{ backgroundColor: isLegend ? '#cca800' : '#27b793' }}
                    className="w-full flex flex-col gap-3 font-sans p-4 rounded-[24px] border-4 border-slate-950 shadow-[5px_5px_0_rgba(15,10,25,1)]"
                  >
                    
                    {/* Header bar capsule */}
                    <div className="w-full bg-white border-4 border-slate-950 rounded-[20px] px-4.5 py-3 shadow-[5px_5px_0_rgba(15,10,25,1)] flex items-center justify-between">
                      <span className="text-slate-900 font-black text-lg tracking-tight truncate uppercase pr-2">
                        {zoomedSticker.name}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Download sticker action */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const resolvedPath = zoomedSticker.imagePath.startsWith('/assets/images/') 
                                ? zoomedSticker.imagePath 
                                : `/src/assets/images${zoomedSticker.imagePath}`;
                              
                              // Download by fetching blob
                              const response = await fetch(resolvedPath);
                              const blob = await response.blob();
                              const blobUrl = window.URL.createObjectURL(blob);
                              
                              const link = document.createElement('a');
                              link.href = blobUrl;
                              link.download = `cromo-${zoomedSticker.id}-${zoomedSticker.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(blobUrl);

                              setDownloadNotification(true);
                              setTimeout(() => {
                                setDownloadNotification(false);
                              }, 1800);
                            } catch (err) {
                              // Direct anchor tag download fallback
                              const link = document.createElement('a');
                              link.href = zoomedSticker.imagePath;
                              link.download = `cromo-${zoomedSticker.id}.png`;
                              link.click();
                            }
                          }}
                          className="w-8.5 h-8.5 rounded-full border-2 border-slate-950 flex items-center justify-center bg-white hover:bg-slate-100 transition-all cursor-pointer shadow-[1.5px_1.5px_0_rgba(0,0,0,1)] active:translate-y-0.5"
                          title="Baixar Figurinha"
                          aria-label="Baixar Figurinha"
                        >
                          <Download className="w-4 h-4 text-slate-800" />
                        </button>

                        <button
                          onClick={() => {
                            setZoomedSticker(null);
                            setIsZoomPersistent(false);
                          }}
                          className="w-8.5 h-8.5 bg-black hover:bg-slate-900 text-white rounded-full border-2 border-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-[1.5px_1.5px_0_rgba(0,0,0,1)] active:translate-y-0.5"
                          title="Fechar"
                          aria-label="Fechar"
                        >
                          <X className="w-4 h-4 text-white stroke-[3.5px]" />
                        </button>
                      </div>
                    </div>

                    {/* Shared or downloaded floating notice toast */}
                    {downloadNotification && (
                      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#FFDF1B] border-4 border-slate-950 text-slate-950 rounded-[20px] py-4 px-8 shadow-[6px_6px_0_rgba(0,0,0,1)] text-xs font-black tracking-wider uppercase text-center z-[300] animate-scale-in pointer-events-none whitespace-nowrap">
                        Figurinha baixada com sucesso!
                      </div>
                    )}
                    {copiedNotification && (
                      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#FFDF1B] border-4 border-slate-950 text-slate-950 rounded-[20px] py-4 px-8 shadow-[6px_6px_0_rgba(0,0,0,1)] text-xs font-black tracking-wider uppercase text-center z-[300] animate-scale-in pointer-events-none whitespace-nowrap">
                        Link do Cromo copiado!
                      </div>
                    )}

                    {/* Informações detalhadas white list card wrapper */}
                    <div className="w-full bg-white border-4 border-slate-950 rounded-[20px] p-4.5 shadow-[5px_5px_0_rgba(15,10,25,1)] flex flex-col gap-2.5">
                      
                      {/* Congratulatory message for legendary stickers */}
                      {isSpecial ? (
                        <div style={{ color: '#010101' }} className="py-6 border-b border-slate-100 text-center font-bold text-base font-sans uppercase italic">
                          PARABÉNS!!!<br />VOCÊ conseguiu!!!
                        </div>
                      ) : isLegend ? (
                        <>
                          {/* Quote row */}
                          <div className="py-4 border-b border-slate-200 text-center italic text-slate-800 text-sm font-semibold p-2">
                            "{FOOTBALL_QUOTES[zoomedSticker.id % FOOTBALL_QUOTES.length]}"
                          </div>

                          {/* Large centered Player Legend Name */}
                          <div className="py-4 border-b border-slate-200 text-center">
                            <span className="text-[20px] text-slate-950 font-black tracking-tight leading-none block">
                              {legendLabel}
                            </span>
                          </div>

                          {/* Club row */}
                          <div className="flex justify-between items-start py-1">
                            <span className="text-[10.5px] text-slate-500 font-semibold pt-0.5">
                              Clube
                            </span>
                            <span className="text-[12px] text-slate-900 font-extrabold text-right leading-tight max-w-[150px]">
                              {clubName}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Quote row */}
                          <div className="py-4 border-b border-slate-100 text-center italic text-slate-800 text-sm font-semibold p-2">
                            "{FOOTBALL_QUOTES[zoomedSticker.id % FOOTBALL_QUOTES.length]}"
                          </div>

                          {/* Position row */}
                          <div className="flex justify-between items-baseline py-1 border-b border-slate-100">
                            <span className="text-[10.5px] text-slate-500 font-semibold">
                              {zoomedSticker.slotId.startsWith("MC_") ? "Número" : "Posição"}
                            </span>
                            <span className="text-[12px] text-slate-900 font-extrabold">
                              {zoomedSticker.slotId.startsWith("MC_") ? (targetSlot ? targetSlot.label : "Minicraque") : posName}
                            </span>
                          </div>

                          {/* Club row */}
                          <div className="flex justify-between items-start py-1">
                            <span className="text-[10.5px] text-slate-500 font-semibold pt-0.5">
                              Clube
                            </span>
                            <span className="text-[12px] text-slate-900 font-extrabold text-right leading-tight max-w-[150px]">
                              {clubName}
                            </span>
                          </div>
                        </>
                      )}

                    </div>
                  </div>

                  {/* Transform into Minicraque button positioned below the green box */}
                  {!isLegend && (
                    <button
                      onClick={() => {
                        setZoomedSticker(null);
                        setIsZoomPersistent(false);
                        if (onGoToMiniCraques) onGoToMiniCraques();
                      }}
                      style={{ width: '250px', height: '40px' }}
                      className="mx-auto bg-[#FFDF1B] hover:bg-yellow-300 text-slate-950 rounded-full font-black uppercase tracking-wider border-4 border-slate-950 transition-all cursor-pointer shadow-[4px_4px_0_rgba(15,10,25,1)] hover:shadow-[2px_2px_0_rgba(15,10,25,1)] active:translate-y-0.5 text-center flex items-center justify-center gap-1.5"
                    >
                      <span style={{ width: '300px', fontSize: '10px' }} className="flex justify-center items-center">
                        Cromo especial | MiniCraque
                      </span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })(), document.body)}

        {isEquipeZoomed && createPortal(
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300"
            onClick={() => setIsEquipeZoomed(false)}
          >
            <div 
              className="relative bg-[#7833a9] border-4 border-slate-950 rounded-[32px] shadow-2xl max-w-4xl w-full p-6 overflow-hidden flex flex-col justify-center animate-out duration-300 zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsEquipeZoomed(false)}
                className="absolute top-4 right-4 bg-slate-950 hover:bg-slate-900 border-2 border-slate-950 hover:border-[#FFDF1B] text-[#FFDF1B] w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-lg text-white"
                title="Fechar"
              >
                <X className="w-5 h-5 text-[#FFDF1B]" />
              </button>

              <div className="text-center mb-4 flex flex-col items-center">
                <span 
                  className="text-2xl font-black uppercase tracking-wider select-none animate-bounce-short"
                  style={{ color: '#7bfe68' }}
                >
                  WE ARE CEPE
                </span>
                <p 
                  className="text-purple-100 font-medium opacity-85 mt-1"
                  style={{ fontSize: '14px', fontStyle: 'italic' }}
                >
                  Pessoas incríveis que fazem tudo acontecer!
                </p>
              </div>

              {/* Image Frame with Slate/Dark borders */}
              <div className="relative border-4 border-slate-950 rounded-2xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center max-h-[70vh]">
                <img 
                  id="equipe-zoom-img"
                  src="/assets/images/EQUIPE.png"
                  alt="Foto da Equipe CEPE"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const currentSrc = e.currentTarget.src;
                    if (currentSrc.includes('/assets/images/')) {
                      e.currentTarget.src = '/EQUIPE.png';
                    }
                  }}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              </div>

              {/* Extra action bar */}
              <div className="flex justify-center items-center mt-4">
                <button
                  onClick={async () => {
                    try {
                      const imgEl = document.getElementById('equipe-zoom-img') as HTMLImageElement | null;
                      const downloadUrl = imgEl ? imgEl.src : '/assets/images/EQUIPE.png';
                      
                      const response = await fetch(downloadUrl);
                      const blob = await response.blob();
                      const blobUrl = window.URL.createObjectURL(blob);
                      
                      const link = document.createElement('a');
                      link.href = blobUrl;
                      link.download = `equipe-cepe.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(blobUrl);
                    } catch (error) {
                      console.error('Failed to download image', error);
                      // Fallback to direct link download if fetch fails
                      const link = document.createElement('a');
                      link.href = '/assets/images/EQUIPE.png';
                      link.download = `equipe-cepe.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="bg-[#24a044] hover:bg-[#1a8535] text-white px-6 py-2.5 rounded-full font-extrabold uppercase tracking-wider text-xs border-4 border-slate-950 shadow-[4px_4px_0_rgba(15,10,25,1)] hover:shadow-[2px_2px_0_rgba(15,10,25,1)] active:translate-y-0.5 transition-all duration-150 cursor-pointer flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar Foto
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
        </div>

        {/* Right Arrow Button (StickerBench styling, completely outside / visible) */}
        <button
          onClick={() => {
            if (currentPageIndex < 38) {
              playPageFlip();
              onPageIndexChange(currentPageIndex + 1);
            } else {
              playPageFlip();
              onNextPage();
            }
          }}
          data-html2canvas-ignore="true"
          className="absolute right-0.5 sm:right-2 z-30 bg-slate-950 hover:bg-slate-900 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border-2 border-slate-950 hover:scale-105 active:scale-95 focus:outline-none print:hidden cursor-pointer"
          style={{
            width: '36px',
            height: '36px',
            padding: '0px',
          }}
          aria-label={currentPageIndex < 38 ? "Ir para Próxima Página" : "Ir para a Escalação"}
        >
          <ChevronRight className="w-5 h-5 stroke-[3.5] text-white" />
        </button>
      </div>

      {/* Pages control indicators */}
      <div className="flex justify-center items-center max-w-5xl mx-auto w-full px-2 sm:px-16 print:hidden font-sans py-2">
        <div
          style={{ 
            backgroundColor: (currentPageIndex === 38) ? '#10b981' : (currentPageIndex >= 36) ? '#cca800' : (currentPageIndex >= 18) ? '#db2777' : '#7833a9',
            borderWidth: '2px',
            borderColor: '#000000',
            borderStyle: 'solid',
            fontSize: '11px',
            lineHeight: '14px',
            width: '220px'
          }}
          className="px-6 py-2.5 rounded-full text-white font-black shadow-[3px_3px_0_rgba(0,0,0,1)] tracking-wide text-center select-none"
        >
          {(() => {
            if (currentPageIndex >= 0 && currentPageIndex <= 17) {
              return `Pág ${currentPageIndex + 1} - Convocados`;
            }
            if (currentPageIndex >= 18 && currentPageIndex <= 35) {
              return `Pág ${currentPageIndex - 17} - Especiais`;
            }
            if (currentPageIndex >= 36 && currentPageIndex <= 37) {
              return `Pág ${currentPageIndex - 35} - The Legends`;
            }
            return `Pág 1 - Extra`;
          })()}
        </div>
      </div>

      {autoGlueCount !== null && (
        <div className="fixed inset-0 bg-black/45 z-[350] flex items-center justify-center p-4 pointer-events-none animate-fade-in print:hidden">
          <div 
            style={{ backgroundColor: '#000000', color: '#ffffff' }}
            className="border-4 border-slate-950 rounded-full px-6 py-3.5 shadow-[5px_5px_0_rgba(0,0,0,1)] flex items-center justify-center gap-3.5 pointer-events-auto max-w-[95vw] sm:max-w-md animate-scale-in"
          >
            <span 
              style={{ backgroundColor: '#7b2e98', color: '#ffffff' }}
              className="text-[10px] font-black uppercase px-3 py-1.5 rounded-full select-none shadow border-2 border-slate-950 tracking-wider shrink-0"
            >
              AUTO-TÁTICO
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-white">
              {autoGlueCount > 0 
                ? `${autoGlueCount} figurinhas coladas!` 
                : "Nenhuma figurinha nova para colar!"}
            </span>
            <button 
              onClick={() => setAutoGlueCount(null)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 shrink-0 cursor-pointer flex items-center justify-center"
              aria-label="Fechar"
            >
              <X className="w-4 h-4 stroke-[3px]" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
