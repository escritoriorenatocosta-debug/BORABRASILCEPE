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
  status: 'inventory' | 'glued'; // glued on the album, or in the pocket bench
  gluedAt?: string;     // Date string
  slotId?: string;      // Optional custom slot ID where it was glued
}

export interface AlbumState {
  currentPage: 'cover' | 'album' | 'back'; // 'cover' (Page 1), 'album' (Pages 2-3 inside spread), 'back' (Page 4 back cover)
  userStickers: Record<number, UserSticker>; // Mapping sticker ID to its state
  packsOpened: number;
}
