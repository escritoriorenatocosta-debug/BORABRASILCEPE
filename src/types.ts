/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Sticker {
  id: number;           // 1 to 12
  name: string;         // e.g., "Jânio Santos"
  role: string;         // e.g., "Editora", "Informática", "Sumid"
  imagePath: string;    // e.g., "/input_file_1.png"
  slotId: string;       // Matches "BRA_0" to "BRA_11"
}

export interface Slot {
  id: string;           // "BRA_0" to "BRA_11"
  label: string;        // "BRA 0" to "BRA 11"
  left: number;         // X coordinate percentage on the open page spread
  top: number;          // Y coordinate percentage on the open page spread
  width: number;        // Width percentage
  height: number;       // Height percentage
}

export interface UserSticker {
  stickerId: number;    // Reference to Sticker id
  status: 'inventory' | 'glued' | 'vaulted'; // glued on the album, or in the pocket bench, or stored in the wardrobe/vault
  gluedAt?: string;     // Date string
  slotId?: string;      // Optional custom slot ID where it was glued
}

export interface AlbumState {
  currentPage: 'cover' | 'album' | 'back'; // 'cover' (Page 1), 'album' (Pages 2-3 inside spread), 'back' (Page 4 back cover)
  userStickers: Record<number, UserSticker>; // Mapping sticker ID to its state
  packsOpened: number;
}

export function getPageIndexForSlotId(slotId: string): number {
  for (let p = 0; p <= 38; p++) {
    // CONVOCADOS (0 to 17)
    if (p >= 0 && p <= 17) {
      let minId = p * 12;
      let maxId = p * 12 + 11;
      
      if (p === 3) { minId = 48; maxId = 59; }
      else if (p === 4) { minId = 60; maxId = 71; }
      else if (p === 5) { minId = 72; maxId = 83; }
      else if (p === 6) { minId = 84; maxId = 95; }
      else if (p >= 7) {
        minId = 108 + (p - 7) * 12;
        maxId = minId + 11;
      }
      
      if (slotId.startsWith("BRA_")) {
        const num = parseInt(slotId.split("_")[1]);
        if (!isNaN(num) && num >= minId && num <= maxId) {
          return p;
        }
      }
      
      if ((p === 0 && slotId === "SPC_1") ||
          (p === 1 && slotId === "SPC_2") ||
          (p === 2 && slotId === "SPC_3")) {
        return p;
      }
    }
    
    // ESPECIAIS / MINICRAQUES (18 to 35)
    if (p >= 18 && p <= 35) {
      const pageNum = p - 18;
      const minId = pageNum * 12;
      const maxId = pageNum * 12 + 11;
      
      if (slotId.startsWith("MC_")) {
        const num = parseInt(slotId.split("_")[1]);
        if (!isNaN(num) && num >= minId && num <= maxId) {
          return p;
        }
      }
    }
    
    // THE LEGENDS (36 to 37)
    if (p >= 36 && p <= 37) {
      const pageNum = p - 36;
      if (pageNum === 0) {
        if (slotId.startsWith("BRA_")) {
          const num = parseInt(slotId.split("_")[1]);
          if (!isNaN(num) && num >= 36 && num <= 47) {
            return p;
          }
        }
      } else {
        if (slotId.startsWith("BRA_")) {
          const num = parseInt(slotId.split("_")[1]);
          if (!isNaN(num) && num >= 96 && num <= 107) {
            return p;
          }
        }
      }
    }

    // EXTRA (38)
    if (p === 38) {
      if (slotId.startsWith("EXT_")) {
        return p;
      }
    }
  }
  return 0; // fallback
}
