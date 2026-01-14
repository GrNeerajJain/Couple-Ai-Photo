
import React, { useRef } from 'react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  label: string;
  description: string;
  imageData: ImageData | null;
  onUpload: (data: ImageData) => void;
  onClear: () => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  description,
  imageData,
  onUpload,
  onClear,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      onUpload({
        base64: base64String,
        mimeType: file.type,
        previewUrl: URL.createObjectURL(file)
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
        {imageData && !disabled && (
          <button 
            onClick={onClear}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium"
          >
            Change
          </button>
        )}
      </div>
      
      <div 
        onClick={handleClick}
        className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center
          ${imageData 
            ? 'border-transparent' 
            : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {imageData ? (
          <img 
            src={imageData.previewUrl} 
            alt={label} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-sm text-slate-600 mb-1">Click to upload</p>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        )}
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
