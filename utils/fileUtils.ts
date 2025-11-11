import { ImageFile } from '../types';

export const convertFileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ file, base64, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const base64ToImageFile = async (
  dataUrl: string, 
  filename: string,
): Promise<ImageFile> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: blob.type });
  const base64 = dataUrl.split(',')[1];
  return { file, base64, mimeType: blob.type };
};
