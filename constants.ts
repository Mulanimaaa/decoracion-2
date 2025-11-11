
import { StyleOption, AspectRatio } from './types';

export const DESIGN_STYLES: StyleOption[] = [
  { id: 'modern', name: 'Modern', imageUrl: 'https://picsum.photos/seed/modern/200' },
  { id: 'minimalist', name: 'Minimalist', imageUrl: 'https://picsum.photos/seed/minimalist/200' },
  { id: 'rustic', name: 'Rustic', imageUrl: 'https://picsum.photos/seed/rustic/200' },
  { id: 'eclectic', name: 'Eclectic', imageUrl: 'https://picsum.photos/seed/eclectic/200' },
  { id: 'futuristic', name: 'Futuristic', imageUrl: 'https://picsum.photos/seed/futuristic/200' },
  { id: 'coastal', name: 'Coastal', imageUrl: 'https://picsum.photos/seed/coastal/200' },
  { id: 'bohemian', name: 'Bohemian', imageUrl: 'https://picsum.photos/seed/bohemian/200' },
  { id: 'industrial', name: 'Industrial', imageUrl: 'https://picsum.photos/seed/industrial/200' },
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
    { value: AspectRatio.SQUARE, label: 'Square (1:1)' },
    { value: AspectRatio.LANDSCAPE, label: 'Landscape (16:9)' },
    { value: AspectRatio.PORTRAIT, label: 'Portrait (9:16)' },
    { value: AspectRatio.LANDSCAPE_3_4, label: 'Wide (3:4)' },
    { value: AspectRatio.PORTRAIT_4_3, label: 'Tall (4:3)' },
];

export const MODELS = {
    EDIT: 'gemini-2.5-flash-image',
    GENERATE: 'imagen-4.0-generate-001',
    CHAT: 'gemini-2.5-flash',
    ANALYZE: 'gemini-2.5-flash',
    COMPLEX: 'gemini-2.5-pro',
};

export const LOADING_MESSAGES = [
    'Envisioning new possibilities...',
    'Painting the virtual walls...',
    'Choosing the perfect sofa...',
    'Arranging digital decor...',
    'Hanging virtual art...',
    'Letting creativity flow...',
    'The AI is decorating...',
    'Finalizing the design...'
];
