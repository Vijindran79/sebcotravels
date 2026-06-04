/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum AppState {
  IDLE,
  LOADING,
  LOADED,
  SELECTING,
  ENHANCING,
  ENHANCED,
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ImageDescription {
  selectionDescription: string;
  prompt: string;
}

export interface HistoryStep {
  imageSrc: string;
  originalRect: Rect | null;
  description?: ImageDescription;
}
