
export interface ImageData {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export type UploadSlot = 'person1' | 'person2' | 'reference';

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export type GenerationStyle = 'realistic' | 'cinematic' | 'artistic' | 'vintage' | 'anime';

export type DetailLevel = 'default' | 'low' | 'medium' | 'high';

export type PoseVariation = 'default' | 'exact' | 'relaxed' | 'dynamic';

export type CameraAngle = 'default' | 'eye-level' | 'low-angle' | 'high-angle' | 'wide-shot' | 'close-up';

export interface GenerationState {
  isGenerating: boolean;
  status: string;
  error: string | null;
  resultUrl: string | null;
}
