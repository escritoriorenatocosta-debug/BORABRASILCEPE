/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sticker, Slot } from './types';

export const STICKERS: Sticker[] = [
  // PAGE 1 STICKERS (1 - 12)
  {
    id: 1,
    name: "Janio Santos",
    role: "Editora",
    imagePath: "/src/assets/images/input_file_1.png",
    slotId: "BRA_0"
  },
  {
    id: 2,
    name: "Davizinho",
    role: "Revista",
    imagePath: "/src/assets/images/input_file_2.png",
    slotId: "BRA_1"
  },
  {
    id: 3,
    name: "Diego",
    role: "Informática",
    imagePath: "/src/assets/images/input_file_3.png",
    slotId: "BRA_2"
  },
  {
    id: 4,
    name: "Ed Soares",
    role: "Sumid",
    imagePath: "/src/assets/images/input_file_4.png",
    slotId: "BRA_3"
  },
  {
    id: 5,
    name: "Guilherme",
    role: "Informática",
    imagePath: "/src/assets/images/input_file_5.png",
    slotId: "BRA_4"
  },
  {
    id: 6,
    name: "Júlia Lobo",
    role: "Sumid",
    imagePath: "/src/assets/images/input_file_6.png",
    slotId: "BRA_5"
  },
  {
    id: 7,
    name: "Lucas Furtado",
    role: "Sumid",
    imagePath: "/src/assets/images/input_file_7.png",
    slotId: "BRA_6"
  },
  {
    id: 8,
    name: "Costinha",
    role: "Sumid",
    imagePath: "/src/assets/images/input_file_8.png",
    slotId: "BRA_7"
  },
  {
    id: 9,
    name: "Rodolfo",
    role: "Revista",
    imagePath: "/src/assets/images/input_file_9.png",
    slotId: "BRA_8"
  },
  {
    id: 10,
    name: "Rodolfinho",
    role: "Comercial",
    imagePath: "/src/assets/images/input_file_10.png",
    slotId: "BRA_9"
  },
  {
    id: 11,
    name: "Nando",
    role: "Editora",
    imagePath: "/src/assets/images/input_file_11.png",
    slotId: "BRA_10"
  },
  {
    id: 12,
    name: "Marina",
    role: "SUMID",
    imagePath: "/src/assets/images/input_file_12.png",
    slotId: "BRA_11"
  },

  // PAGE 2 STICKERS (13 - 24) - Duplicated version
  {
    id: 13,
    name: "Arthur",
    role: "SUMID",
    imagePath: "/src/assets/images/input_file_13.png",
    slotId: "BRA_12"
  },
  {
    id: 14,
    name: "Fabíola",
    role: "DEDIG",
    imagePath: "/src/assets/images/input_file_14.png",
    slotId: "BRA_13"
  },
  {
    id: 15,
    name: "Silvia",
    role: "Revista",
    imagePath: "/src/assets/images/input_file_15.png",
    slotId: "BRA_14"
  },
  {
    id: 16,
    name: "Vanessa",
    role: "Manutenção",
    imagePath: "/src/assets/images/input_file_16.png",
    slotId: "BRA_15"
  },
  {
    id: 17,
    name: "Dudley",
    role: "Editora",
    imagePath: "/src/assets/images/input_file_17.png",
    slotId: "BRA_16"
  },
  {
    id: 18,
    name: "Bruna",
    role: "DEDIG",
    imagePath: "/src/assets/images/input_file_18.png",
    slotId: "BRA_17"
  },
  {
    id: 19,
    name: "Larissa",
    role: "MKT",
    imagePath: "/src/assets/images/input_file_19.png",
    slotId: "BRA_18"
  },
  {
    id: 20,
    name: "Mariana",
    role: "Educação",
    imagePath: "/src/assets/images/input_file_20.png",
    slotId: "BRA_19"
  },
  {
    id: 21,
    name: "Roberta",
    role: "Galeria Reciclada",
    imagePath: "/src/assets/images/input_file_21.png",
    slotId: "BRA_20"
  },
  {
    id: 22,
    name: "Stefane",
    role: "Comercial",
    imagePath: "/src/assets/images/input_file_22.png",
    slotId: "BRA_21"
  },
  {
    id: 23,
    name: "Sebastião",
    role: "Editora",
    imagePath: "/src/assets/images/input_file_23.png",
    slotId: "BRA_22"
  },
  {
    id: 24,
    name: "Victor",
    role: "DEDIG",
    imagePath: "/src/assets/images/input_file_24.png",
    slotId: "BRA_23"
  },

  // MINICRAQUES PAGE 3 STICKERS (101 - 112)
  { id: 101, name: "Janio Santos", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(10).png", slotId: "MC_0" },
  { id: 102, name: "Davizinho", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(4).png", slotId: "MC_1" },
  { id: 103, name: "Diego Maradona", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(5).png", slotId: "MC_2" },
  { id: 104, name: "Ed Soares", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(7).png", slotId: "MC_3" },
  { id: 105, name: "Guilherme", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(9).png", slotId: "MC_4" },
  { id: 106, name: "Júlia Lobo", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(11).png", slotId: "MC_5" },
  { id: 107, name: "Lucas Furtado", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(13).png", slotId: "MC_6" },
  { id: 108, name: "Costinha", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(3).png", slotId: "MC_7" },
  { id: 109, name: "Rodolfo G.", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(19).png", slotId: "MC_8" },
  { id: 110, name: "Rodolfo E.", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(18).png", slotId: "MC_9" },
  { id: 111, name: "Nando", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(16).png", slotId: "MC_10" },
  { id: 112, name: "Mascote CEPE", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(15).png", slotId: "MC_11" },

  // MINICRAQUES PAGE 4 STICKERS (113 - 124)
  { id: 113, name: "Jânio Santos II", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(1).png", slotId: "MC_12" },
  { id: 114, name: "Davizinho II", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(8).png", slotId: "MC_13" },
  { id: 115, name: "Diego Maradona II", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(21).png", slotId: "MC_14" },
  { id: 116, name: "Ed II", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(23).png", slotId: "MC_15" },
  { id: 117, name: "Guilherme II", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(6).png", slotId: "MC_16" },
  { id: 118, name: "Júlia Lobo II", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(2).png", slotId: "MC_17" },
  { id: 119, name: "Lucas Furtado II", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(12).png", slotId: "MC_18" },
  { id: 120, name: "Costinha II", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(14).png", slotId: "MC_19" },
  { id: 121, name: "Rodolfo G. II", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(17).png", slotId: "MC_20" },
  { id: 122, name: "Rodolfo E. II", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(22).png", slotId: "MC_21" },
  { id: 123, name: "Nando II", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(20).png", slotId: "MC_22" },
  { id: 124, name: "Mascote CEPE II", role: "Minicraque ⚡", imagePath: "/src/assets/images/minicraque(24).png", slotId: "MC_23" },

  // SPECIAL PAGE COMPLETION CROMOS
  {
    id: 25,
    name: "CEPE OURO",
    role: "Cromo Especial 🥇",
    imagePath: "/src/assets/images/cromoespecial1.png", // will render elegant golden custom vector frame
    slotId: "SPC_1"
  },
  {
    id: 26,
    name: "SUPER CEPE",
    role: "Cromo Especial 🏆",
    imagePath: "/src/assets/images/Premio.png", // will render elegant golden custom vector frame
    slotId: "SPC_2"
  },
  {
    id: 27,
    name: "BORA BRASIL",
    role: "Cromo Especial 🎖️",
    imagePath: "/src/assets/images/cromoespecial2.png",
    slotId: "SPC_3"
  },
  {
    id: 28,
    name: "CAMPEÃO SUPREMO",
    role: "Cromo Lendário 👑",
    imagePath: "/src/assets/images/Final.png",
    slotId: "SPC_4"
  }
];

export const SLOTS: Slot[] = [
  // --- PAGE 1 SLOTS ---
  // Left Page Slots (Page 1)
  { id: "BRA_0", label: "Goleira/Goleiro", left: 3.5, top: 37.3, width: 11.2, height: 24.3 },
  { id: "BRA_1", label: "Lateral Direito", left: 17.8, top: 37.3, width: 11.2, height: 24.3 },
  { id: "BRA_2", label: "Zagueira/Zagueiro", left: 32.1, top: 37.3, width: 11.2, height: 24.3 },
  { id: "BRA_3", label: "Zagueira/Zagueiro", left: 17.8, top: 68.3, width: 11.2, height: 24.3 },
  { id: "BRA_4", label: "Lateral Esquerdo", left: 32.1, top: 68.3, width: 11.2, height: 24.3 },

  // Right Page Slots (Page 1)
  { id: "BRA_5", label: "Volante (Meio)", left: 55.4, top: 6.2, width: 11.2, height: 24.3 },
  { id: "BRA_6", label: "Meia Armador", left: 69.7, top: 6.2, width: 11.2, height: 24.3 },
  { id: "BRA_7", label: "Meio-Campo", left: 83.9, top: 6.2, width: 11.2, height: 24.3 },
  { id: "BRA_8", label: "Ponta Esquerda", left: 55.4, top: 37.3, width: 11.2, height: 24.3 },
  { id: "BRA_9", label: "Centroavante", left: 69.7, top: 37.3, width: 11.2, height: 24.3 },
  { id: "BRA_10", label: "Ponta Direita", left: 83.9, top: 37.3, width: 11.2, height: 24.3 },
  { id: "BRA_11", label: "Técnico (Jogador)", left: 83.9, top: 68.3, width: 11.2, height: 24.3 },

  // --- PAGE 2 SLOTS ---
  // Left Page Slots (Page 2 - identical positions to page 1)
  { id: "BRA_12", label: "Goleira/Goleiro II", left: 3.5, top: 37.3, width: 11.2, height: 24.3 },
  { id: "BRA_13", label: "Lateral Direito II", left: 17.8, top: 37.3, width: 11.2, height: 24.3 },
  { id: "BRA_14", label: "Zagueira/Zagueiro II", left: 32.1, top: 37.3, width: 11.2, height: 24.3 },
  { id: "BRA_15", label: "Zagueira/Zagueiro II", left: 17.8, top: 68.3, width: 11.2, height: 24.3 },
  { id: "BRA_16", label: "Lateral Esquerdo II", left: 32.1, top: 68.3, width: 11.2, height: 24.3 },

  // Right Page Slots (Page 2 - identical positions to page 1)
  { id: "BRA_17", label: "Volante (Meio) II", left: 55.4, top: 6.2, width: 11.2, height: 24.3 },
  { id: "BRA_18", label: "Meia Armador II", left: 69.7, top: 6.2, width: 11.2, height: 24.3 },
  { id: "BRA_19", label: "Meio-Campo II", left: 83.9, top: 6.2, width: 11.2, height: 24.3 },
  { id: "BRA_20", label: "Ponta Esquerda II", left: 55.4, top: 37.3, width: 11.2, height: 24.3 },
  { id: "BRA_21", label: "Centroavante II", left: 69.7, top: 37.3, width: 11.2, height: 24.3 },
  { id: "BRA_22", label: "Ponta Direita II", left: 83.9, top: 37.3, width: 11.2, height: 24.3 },
  { id: "BRA_23", label: "Técnico II", left: 83.9, top: 68.3, width: 11.2, height: 24.3 },

  // --- SPECIAL CROMO COVER SLOTS (below the goalkeeper) ---
  { id: "SPC_1", label: "Cromo Especial 🥇", left: 3.5, top: 68.3, width: 11.2, height: 24.3 },
  { id: "SPC_2", label: "Cromo Especial 🏆", left: 3.5, top: 68.3, width: 11.2, height: 24.3 },
  { id: "SPC_3", label: "Cromo Especial 🎖️", left: 3.5, top: 68.3, width: 11.2, height: 24.3 },
  { id: "SPC_4", label: "Campeão Supremo 👑", left: 3.5, top: 68.3, width: 11.2, height: 24.3 },

  // --- MINICRAQUE PAGE 3 SLOTS (Same coordinates as Page 1) ---
  { id: "MC_0", label: "Nº 1", left: 3.5, top: 37.3, width: 11.2, height: 24.3 },
  { id: "MC_1", label: "Nº 2", left: 17.8, top: 37.3, width: 11.2, height: 24.3 },
  { id: "MC_2", label: "Nº 3", left: 32.1, top: 37.3, width: 11.2, height: 24.3 },
  { id: "MC_3", label: "Nº 4", left: 17.8, top: 68.3, width: 11.2, height: 24.3 },
  { id: "MC_4", label: "Nº 5", left: 32.1, top: 68.3, width: 11.2, height: 24.3 },
  { id: "MC_5", label: "Nº 6", left: 55.4, top: 6.2, width: 11.2, height: 24.3 },
  { id: "MC_6", label: "Nº 7", left: 69.7, top: 6.2, width: 11.2, height: 24.3 },
  { id: "MC_7", label: "Nº 8", left: 83.9, top: 6.2, width: 11.2, height: 24.3 },
  { id: "MC_8", label: "Nº 9", left: 55.4, top: 37.3, width: 11.2, height: 24.3 },
  { id: "MC_9", label: "Nº 10", left: 69.7, top: 37.3, width: 11.2, height: 24.3 },
  { id: "MC_10", label: "Nº 11", left: 83.9, top: 37.3, width: 11.2, height: 24.3 },
  { id: "MC_11", label: "Nº 12", left: 83.9, top: 68.3, width: 11.2, height: 24.3 },

  // --- MINICRAQUE PAGE 4 SLOTS (Same coordinates as Page 2) ---
  { id: "MC_12", label: "Nº 13", left: 3.5, top: 37.3, width: 11.2, height: 24.3 },
  { id: "MC_13", label: "Nº 14", left: 17.8, top: 37.3, width: 11.2, height: 24.3 },
  { id: "MC_14", label: "Nº 15", left: 32.1, top: 37.3, width: 11.2, height: 24.3 },
  { id: "MC_15", label: "Nº 16", left: 17.8, top: 68.3, width: 11.2, height: 24.3 },
  { id: "MC_16", label: "Nº 17", left: 32.1, top: 68.3, width: 11.2, height: 24.3 },
  { id: "MC_17", label: "Nº 18", left: 55.4, top: 6.2, width: 11.2, height: 24.3 },
  { id: "MC_18", label: "Nº 19", left: 69.7, top: 6.2, width: 11.2, height: 24.3 },
  { id: "MC_19", label: "Nº 20", left: 83.9, top: 6.2, width: 11.2, height: 24.3 },
  { id: "MC_20", label: "Nº 21", left: 55.4, top: 37.3, width: 11.2, height: 24.3 },
  { id: "MC_21", label: "Nº 22", left: 69.7, top: 37.3, width: 11.2, height: 24.3 },
  { id: "MC_22", label: "Nº 23", left: 83.9, top: 37.3, width: 11.2, height: 24.3 },
  { id: "MC_23", label: "Nº 24", left: 83.9, top: 68.3, width: 11.2, height: 24.3 }
];
