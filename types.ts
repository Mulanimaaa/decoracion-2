
export enum AppView {
  REDESIGNER = 'REDESIGNER',
  STUDIO = 'STUDIO',
  CHAT = 'CHAT',
}

export interface StyleOption {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ImageFile {
  file: File;
  base64: string;
  mimeType: string;
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '9:16',
  LANDSCAPE = '16:9',
  PORTRAIT_4_3 = '4:3',
  LANDSCAPE_3_4 = '3:4',
}
