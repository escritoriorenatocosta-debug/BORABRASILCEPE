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
  Star
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
    if (idx === 0) return "CONVOCADOS 1";
    if (idx === 1) return "CONVOCADOS 2";
    if (idx === 2) return "CONVOCADOS 3";
    if (idx === 3) return "ESPECIAIS 1";
    if (idx === 4) return "ESPECIAIS 2";
    if (idx === 5) return "ESPECIAIS 3";
    return "THE LEGENDS";
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
    if (currentPageIndex === 0) {
      return (slot.id.startsWith("BRA_") && parseInt(slot.id.split("_")[1]) <= 11) || slot.id === "SPC_1";
    } else if (currentPageIndex === 1) {
      return (slot.id.startsWith("BRA_") && parseInt(slot.id.split("_")[1]) >= 12 && parseInt(slot.id.split("_")[1]) <= 23) || slot.id === "SPC_2";
    } else if (currentPageIndex === 2) {
      return (slot.id.startsWith("BRA_") && parseInt(slot.id.split("_")[1]) >= 24 && parseInt(slot.id.split("_")[1]) <= 35) || slot.id === "SPC_3";
    } else if (currentPageIndex === 3) {
      return slot.id.startsWith("MC_") && parseInt(slot.id.split("_")[1]) <= 11;
    } else if (currentPageIndex === 4) {
      return slot.id.startsWith("MC_") && parseInt(slot.id.split("_")[1]) >= 12 && parseInt(slot.id.split("_")[1]) <= 23;
    } else if (currentPageIndex === 5) {
      return slot.id.startsWith("MC_") && parseInt(slot.id.split("_")[1]) >= 24 && parseInt(slot.id.split("_")[1]) <= 35;
    } else {
      return slot.id.startsWith("BRA_") && parseInt(slot.id.split("_")[1]) >= 36 && parseInt(slot.id.split("_")[1]) <= 47;
    }
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
        const isMinicraqueSticker = draggingSticker.id >= 101 && draggingSticker.id <= 136;
        const isMinicraqueSlot = slot.id.startsWith("MC_");

        const isTraditionalSticker = draggingSticker.id >= 1 && draggingSticker.id <= 48;
        const isTraditionalSlot = slot.id.startsWith("BRA_");

        if (isMinicraqueSlot) {
          if (!isMinicraqueSticker) return;
          const expectedSlotId = `MC_${draggingSticker.id - 101}`;
          if (slot.id !== expectedSlotId) {
            return;
          }
        } else if (isTraditionalSlot) {
          if (!isTraditionalSticker) return;
          const expectedSlotId = `BRA_${draggingSticker.id - 1}`;
          if (slot.id !== expectedSlotId) {
            return;
          }
        } else {
          // Special/Other slot checks (exact one-to-one match by predefined slotId)
          if (draggingSticker.slotId !== slot.id) {
            return;
          }
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
      const isMinicraqueSticker = selectedSticker.id >= 101 && selectedSticker.id <= 136;
      const isMinicraqueSlot = slot.id.startsWith("MC_");

      const isTraditionalSticker = selectedSticker.id >= 1 && selectedSticker.id <= 48;
      const isTraditionalSlot = slot.id.startsWith("BRA_");

      if (isMinicraqueSlot) {
        if (!isMinicraqueSticker) return;
        const expectedSlotId = `MC_${selectedSticker.id - 101}`;
        if (slot.id !== expectedSlotId) {
          return;
        }
      } else if (isTraditionalSlot) {
        if (!isTraditionalSticker) return;
        const expectedSlotId = `BRA_${selectedSticker.id - 1}`;
        if (slot.id !== expectedSlotId) {
          return;
        }
      } else {
        if (selectedSticker.slotId !== slot.id) {
          return;
        }
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

  // Auto Lineup helper ("Auto-escalar" team helper)
  const handleAutoLineup = () => {
    // Collect all unique available inventory stickers
    const available = benchStickers.map(b => ({ ...b }));
    if (available.length === 0) return;

    playGlue();

    const gluedOnRun = new Set<number>();

    // Iterate through all empty slots on current page (ignoring special slots)
    activeSlots.filter(s => s.id.startsWith("BRA_") || s.id.startsWith("MC_")).forEach(slot => {
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

          // Deduct count
          targetBundle.count -= 1;
          if (targetBundle.count <= 0) {
            available.splice(targetBundleIdx, 1);
          }
        }
      }
    });
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

      const coreGluedCount = new Set(
        userStickers
          .filter(u => u.status === 'glued' && u.stickerId < 201)
          .map(u => u.stickerId)
      ).size;
      const totalRequired = STICKERS.filter(s => s.id < 201).length;
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
            <div 
              style={{ backgroundColor: '#7b2e98' }}
              className="w-full border-4 border-slate-950 rounded-[28px] p-4.5 shadow-xl flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 z-20 text-center md:text-left"
            >
              <div className="flex flex-col items-center md:items-start font-sans">
                <div className="flex items-center gap-2">
                  <span 
                    style={{ color: '#000000' }}
                    className="bg-[#FFDF1B] text-[10px] font-black uppercase px-3 py-1 rounded-full select-none shadow border-2 border-slate-950 tracking-wider"
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
                    title="Escalar automaticamente os disponíveis nas posições livres"
                    className="px-4 py-2 bg-[#FFDF1B] hover:bg-[#ffe535] text-slate-950 border-2 border-slate-950 font-black text-xs rounded-full shadow-[2px_2px_0_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <span>AUTO-ESCALAR</span>
                  </button>
                )}

                {userStickers.some(u => u.status === 'glued' && u.slotId) && (
                  <button 
                    onClick={handleClearField}
                    title="Desescalar todo o time e retornar todos para a bancada"
                    className="px-4 py-2 bg-[#e21b3c] hover:bg-red-700 text-white border-2 border-slate-950 font-black text-xs rounded-full shadow-[2px_2px_0_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <RefreshCcw className="w-3.5 h-3.5 text-white" />
                    <span>LIMPAR CAMPO</span>
                  </button>
                )}
              </div>
            </div>

            {/* PAGE TOGGLER FOR PAGE 1, 2, 3 & 4 (48 STICKERS TOTAL) - PREMIUM FLAT DESIGN PANEL */}
            <div 
              data-html2canvas-ignore="true" 
              style={{ backgroundColor: '#ffffff' }}
              className="w-full border-4 border-slate-950 rounded-[32px] p-4 flex flex-col xl:flex-row items-center justify-center gap-4 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full xl:w-auto font-sans flex-wrap justify-center">
                <button
                  onClick={() => {
                    if (currentPageIndex !== 0) {
                      playPageFlip();
                      onPageIndexChange(0);
                    }
                  }}
                  style={currentPageIndex === 0 ? { backgroundColor: '#7b2e98' } : undefined}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                    currentPageIndex === 0
                      ? 'text-white font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-800'
                  }`}
                >
                  <span className="font-extrabold uppercase text-[11px] tracking-wide">CONVOCADOS 1</span>
                  <span className="font-mono text-[11px] bg-black/40 px-2.5 py-0.5 rounded-full">
                    {userStickers.filter(u => u.status === 'glued' && u.stickerId <= 12).length}/12
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (currentPageIndex !== 1) {
                      playPageFlip();
                      onPageIndexChange(1);
                    }
                  }}
                  style={currentPageIndex === 1 ? { backgroundColor: '#7b2e98' } : undefined}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                    currentPageIndex === 1
                      ? 'text-white font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-800'
                  }`}
                >
                  <span className="font-extrabold uppercase text-[11px] tracking-wide">CONVOCADOS 2</span>
                  <span className="font-mono text-[11px] bg-black/40 px-2.5 py-0.5 rounded-full">
                    {userStickers.filter(u => u.status === 'glued' && u.stickerId >= 13 && u.stickerId <= 24).length}/12
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (currentPageIndex !== 2) {
                      playPageFlip();
                      onPageIndexChange(2);
                    }
                  }}
                  style={currentPageIndex === 2 ? { backgroundColor: '#7b2e98' } : undefined}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                    currentPageIndex === 2
                      ? 'text-white font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-800'
                  }`}
                >
                  <span className="font-extrabold uppercase text-[11px] tracking-wide">CONVOCADOS 3</span>
                  <span className="font-mono text-[11px] bg-black/40 px-2.5 py-0.5 rounded-full">
                    {userStickers.filter(u => u.status === 'glued' && u.stickerId >= 25 && u.stickerId <= 36).length}/12
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (currentPageIndex !== 3) {
                      playPageFlip();
                      onPageIndexChange(3);
                    }
                  }}
                  style={currentPageIndex === 3 ? { backgroundColor: '#db2777' } : undefined}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                    currentPageIndex === 3
                      ? 'text-white font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-800'
                  }`}
                >
                  <span className="font-extrabold uppercase text-[11px] tracking-wide">ESPECIAIS 1 (⚡)</span>
                  <span className="font-mono text-[11px] bg-black/40 px-2.5 py-0.5 rounded-full">
                    {userStickers.filter(u => u.status === 'glued' && u.stickerId >= 101 && u.stickerId <= 112).length}/12
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (currentPageIndex !== 4) {
                      playPageFlip();
                      onPageIndexChange(4);
                    }
                  }}
                  style={currentPageIndex === 4 ? { backgroundColor: '#db2777' } : undefined}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                    currentPageIndex === 4
                      ? 'text-white font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-800'
                  }`}
                >
                  <span className="font-extrabold uppercase text-[11px] tracking-wide">ESPECIAIS 2 (⚡)</span>
                  <span className="font-mono text-[11px] bg-black/40 px-2.5 py-0.5 rounded-full">
                    {userStickers.filter(u => u.status === 'glued' && u.stickerId >= 113 && u.stickerId <= 124).length}/12
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (currentPageIndex !== 5) {
                      playPageFlip();
                      onPageIndexChange(5);
                    }
                  }}
                  style={currentPageIndex === 5 ? { backgroundColor: '#db2777' } : undefined}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                    currentPageIndex === 5
                      ? 'text-white font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-800'
                  }`}
                >
                  <span className="font-extrabold uppercase text-[11px] tracking-wide">ESPECIAIS 3 (⚡)</span>
                  <span className="font-mono text-[11px] bg-black/40 px-2.5 py-0.5 rounded-full">
                    {userStickers.filter(u => u.status === 'glued' && u.stickerId >= 125 && u.stickerId <= 136).length}/12
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (currentPageIndex !== 6) {
                      playPageFlip();
                      onPageIndexChange(6);
                    }
                  }}
                  style={currentPageIndex === 6 ? { backgroundColor: '#cca800' } : undefined}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none ${
                    currentPageIndex === 6
                      ? 'text-white font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-800'
                  }`}
                >
                  <span className="font-extrabold uppercase text-[11px] tracking-wide">🏆 THE LEGENDS</span>
                  <span className="font-mono text-[11px] bg-black/40 px-2.5 py-0.5 rounded-full">
                    {userStickers.filter(u => u.status === 'glued' && u.stickerId >= 37 && u.stickerId <= 48).length}/12
                  </span>
                </button>
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
          src={currentPageIndex === 6 ? "/src/assets/images/PAGINA_legends.png" : (currentPageIndex >= 3) ? "/src/assets/images/PAGINA3.png" : "/src/assets/images/PAGINA1.png"}
          alt="Álbum Bora Brasil Aberto"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const currentSrc = e.currentTarget.src;
            if (currentSrc.includes('/src/assets/images/')) {
              e.currentTarget.src = currentPageIndex === 6 ? '/PAGINA_legends.png' : (currentPageIndex >= 3) ? '/PAGINA3.png' : '/PAGINA1.png';
            }
          }}
          className="w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Floating spine crease shade */}
        <div className="absolute inset-y-0 left-[49.7%] w-1 sm:w-2 bg-gradient-to-r from-black/30 via-black/50 to-black/30 pointer-events-none z-10 print:hidden" />

        {/* Render Page Field Slots */}
        {activeSlots.map((slot, index) => {
          // Check if there is an active glued sticker at this specific slot
          const gluedSticker = getGluedStickerOnSlot(slot.id);

          const belongsToThisSlot = activeSelectedSticker && activeSelectedSticker.slotId === slot.id;
          const isTargetedByDrag = draggingSticker; // Any sticker is dynamic/glow candidate
          const isCurrentlyHovered = activeHoveredSlot === slot.id;

          const isGlued = !!gluedSticker;
          const isSpecial = slot.id.startsWith('SPC_');

          // Highlight rule: if we clicked or are dragging a sticker, only glow the correct specific slot for minicraques
          const currentTargetSticker = draggingSticker || activeSelectedSticker;
          const shouldSlotGlow = (() => {
            if (!currentTargetSticker) return false;
            
            const isMinicraqueSticker = currentTargetSticker.id >= 101 && currentTargetSticker.id <= 136;
            const isMinicraqueSlot = slot.id.startsWith("MC_");

            const isTraditionalSticker = currentTargetSticker.id >= 1 && currentTargetSticker.id <= 48;
            const isTraditionalSlot = slot.id.startsWith("BRA_");

            if (isMinicraqueSlot) {
              if (!isMinicraqueSticker) return false;
              const expectedSlotId = `MC_${currentTargetSticker.id - 101}`;
              return slot.id === expectedSlotId;
            } else if (isTraditionalSlot) {
              if (!isTraditionalSticker) return false;
              const expectedSlotId = `BRA_${currentTargetSticker.id - 1}`;
              return slot.id === expectedSlotId;
            } else {
              return currentTargetSticker.slotId === slot.id;
            }
          })();

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
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (!isSpecial) {
                      playPeel();
                      onUnglueSticker(gluedSticker.id, slot.id);
                    }
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

                    {/* Return back to Bench shortcut (Only for normal standard stickers, special ones are permanently unlocked!) */}
                    {!isSpecial && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playPeel();
                          onUnglueSticker(gluedSticker.id, slot.id);
                        }}
                        title="Excluir"
                        className="bg-red-600 hover:bg-red-500 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer border border-red-400/30"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                      </button>
                    )}
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
                    w-full h-full flex flex-col justify-center items-center border-2 border-dashed
                    transition-all duration-300 relative bg-black/25 text-center p-1
                    ${shouldSlotGlow
                      ? 'border-yellow-400 bg-yellow-400/10 scale-102 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.35)]' 
                      : 'border-emerald-700/60 hover:bg-emerald-800/10 hover:border-emerald-600'}
                    ${isCurrentlyHovered ? 'bg-yellow-400/25 scale-105 border-double border-4' : ''}
                  `}
                >
                  <span 
                    style={{ 
                      fontFamily: 'system-ui',
                      fontSize: '9px',
                      lineHeight: '16px',
                      color: '#dcdcdc',
                      fontStyle: 'normal',
                      fontWeight: 'bold',
                      paddingTop: '0px'
                    }}
                    className="font-bold tracking-tighter uppercase select-none"
                  >
                    {slot.label}
                  </span>
                  
                  {/* Guided glowing beacon when dragging/selecting */}
                  {(shouldSlotGlow) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-400/5 pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center text-white shadow-lg animate-pulse">
                        <span className="text-xl font-black leading-none -mt-0.5 select-none text-white">+</span>
                      </div>
                      <span className="text-[6.5px] font-sans font-bold text-yellow-100 uppercase tracking-widest mt-1 opacity-70">
                        ESCALAR AQUI
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
          const isSpecial = zoomedSticker.id >= 201;
          const isLegend = zoomedSticker.id >= 37 && zoomedSticker.id <= 48;
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
                              const resolvedPath = zoomedSticker.imagePath.startsWith('/src/assets/images/') 
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
                              {zoomedSticker.id >= 101 && zoomedSticker.id <= 124 ? "Número" : "Posição"}
                            </span>
                            <span className="text-[12px] text-slate-900 font-extrabold">
                              {zoomedSticker.id >= 101 && zoomedSticker.id <= 124 ? `Nº ${zoomedSticker.id - 100}` : posName}
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
        </div>

        {/* Right Arrow Button (StickerBench styling, completely outside / visible) */}
        <button
          onClick={() => {
            if (currentPageIndex < 6) {
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
          aria-label={currentPageIndex < 6 ? "Ir para Próxima Página" : "Ir para a Escalação"}
        >
          <ChevronRight className="w-5 h-5 stroke-[3.5] text-white" />
        </button>
      </div>

      {/* Pages control indicators */}
      <div className="flex justify-center items-center max-w-5xl mx-auto w-full px-2 sm:px-16 print:hidden font-sans py-2">
        <div
          style={{ 
            backgroundColor: (currentPageIndex === 6) ? '#cca800' : (currentPageIndex >= 3) ? '#db2777' : '#7833a9',
            borderWidth: '2px',
            borderColor: '#000000',
            borderStyle: 'solid',
            fontSize: '10px',
            lineHeight: '14px',
            width: '220px'
          }}
          className="px-6 py-2.5 rounded-full text-white font-black shadow-[3px_3px_0_rgba(0,0,0,1)] uppercase tracking-widest text-center select-none"
        >
          PÁGINA {currentPageIndex + 1} - {getPageTitleLabel(currentPageIndex)}
        </div>
      </div>

    </div>
  );
}
