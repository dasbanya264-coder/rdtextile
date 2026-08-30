import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  Image as ImageIcon,
  Loader2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { uploadProductImage, validateImageFile } from '../../lib/storageService';

export interface UploadItem {
  id: string;
  file?: File;
  previewUrl: string;
  url?: string;
  progress: number;
  stage: 'idle' | 'validating' | 'compressing' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  isExisting?: boolean;
}

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  onUploadingChange?: (isUploading: boolean) => void;
  folder?: string;
}

export default function ProductImageUploader({
  images,
  onChange,
  maxImages = 6,
  onUploadingChange,
  folder = 'products'
}: ProductImageUploaderProps) {
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Sync existing images into queue on initial load or external update if queue is empty
  useEffect(() => {
    // Check if any uploads are actively in progress
    const hasActiveUploads = uploadQueue.some(
      item => item.stage === 'validating' || item.stage === 'compressing' || item.stage === 'uploading'
    );
    onUploadingChange?.(hasActiveUploads);
  }, [uploadQueue, onUploadingChange]);

  const processFile = async (file: File, itemId: string) => {
    // 1. Validation check
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadQueue(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, stage: 'error', progress: 0, errorMessage: validation.error }
            : item
        )
      );
      return;
    }

    try {
      setUploadQueue(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, stage: 'compressing', progress: 20, errorMessage: undefined }
            : item
        )
      );

      const finalUrl = await uploadProductImage(file, folder, (progress, stage, errorMsg) => {
        setUploadQueue(prev =>
          prev.map(item =>
            item.id === itemId
              ? { ...item, progress, stage, errorMessage: errorMsg }
              : item
          )
        );
      });

      // Update item to completed and update parent images list
      setUploadQueue(prev => {
        const nextQueue = prev.map(item =>
          item.id === itemId
            ? { ...item, stage: 'completed' as const, progress: 100, url: finalUrl }
            : item
        );
        return nextQueue;
      });

      // Append to images list
      onChange([...images, finalUrl]);
    } catch (err: any) {
      console.error('Upload item failed:', err);
      const errMsg = err?.message || 'Upload failed. Please check your connection and try again.';
      setUploadQueue(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, stage: 'error', progress: 0, errorMessage: errMsg }
            : item
        )
      );
    }
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setGlobalError(null);

    const currentCount = images.length + uploadQueue.filter(i => i.stage !== 'completed' && i.stage !== 'error').length;
    const remainingSlots = maxImages - currentCount;

    if (remainingSlots <= 0) {
      setGlobalError(`You have reached the maximum limit of ${maxImages} images.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setGlobalError(`Only ${remainingSlots} image(s) could be added to stay within the limit of ${maxImages}.`);
    }

    const newItems: UploadItem[] = filesToUpload.map(file => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 5,
      stage: 'validating'
    }));

    setUploadQueue(prev => [...prev, ...newItems]);

    // Trigger upload for each new file
    newItems.forEach(item => {
      if (item.file) {
        processFile(item.file, item.id);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetry = (itemId: string) => {
    const item = uploadQueue.find(i => i.id === itemId);
    if (!item || !item.file) return;

    setUploadQueue(prev =>
      prev.map(i =>
        i.id === itemId
          ? { ...i, stage: 'validating', progress: 5, errorMessage: undefined }
          : i
      )
    );
    processFile(item.file, itemId);
  };

  const handleCancelOrRemoveUpload = (itemId: string) => {
    setUploadQueue(prev => {
      const item = prev.find(i => i.id === itemId);
      if (item?.previewUrl && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const handleRemoveExistingImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const triggerReplace = (index: number) => {
    setReplacingIndex(index);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingIndex === null) return;
    setGlobalError(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setGlobalError(validation.error || 'Invalid replacement image.');
      return;
    }

    const replaceId = `replace-${Date.now()}`;
    const preview = URL.createObjectURL(file);
    const replaceItem: UploadItem = {
      id: replaceId,
      file,
      previewUrl: preview,
      progress: 10,
      stage: 'validating'
    };

    setUploadQueue(prev => [...prev, replaceItem]);

    try {
      const newUrl = await uploadProductImage(file, folder, (progress, stage, errMsg) => {
        setUploadQueue(prev =>
          prev.map(i => (i.id === replaceId ? { ...i, progress, stage, errorMessage: errMsg } : i))
        );
      });

      const updated = [...images];
      updated[replacingIndex] = newUrl;
      onChange(updated);

      setUploadQueue(prev => prev.filter(i => i.id !== replaceId));
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to upload replacement image.');
    } finally {
      setReplacingIndex(null);
    }
  };

  // Check active uploads
  const activeUploads = uploadQueue.filter(i => i.stage !== 'completed');

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg,image/*"
        multiple
        onChange={e => handleFilesSelected(e.target.files)}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg,image/*"
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* Global Error Banner */}
      {globalError && (
        <div className="flex items-center justify-between p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{globalError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGlobalError(null)}
            className="p-1 text-red-500 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Gallery / Cards Grid */}
      {(images.length > 0 || activeUploads.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* 1. Existing Uploaded Images */}
          {images.map((imgUrl, index) => {
            const isPrimary = index === 0;
            return (
              <div
                key={`img-${index}`}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all bg-stone-100 aspect-square flex flex-col items-center justify-center ${
                  isPrimary ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Product view ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Primary / Cover Badge */}
                {isPrimary ? (
                  <div className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1 z-10">
                    <Star className="w-3 h-3 fill-current" /> Cover Image
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-stone-900/80 hover:bg-amber-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full transition-all duration-200 shadow z-10"
                    title="Make this the cover/primary photo"
                  >
                    Make Cover
                  </button>
                )}

                {/* Card Action Overlay */}
                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2 z-10">
                  {/* Reorder Buttons */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(index, 'up')}
                      className="p-1.5 bg-white/90 hover:bg-white text-stone-700 rounded-lg shadow-sm transition-transform hover:scale-105"
                      title="Move Left/Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(index, 'down')}
                      className="p-1.5 bg-white/90 hover:bg-white text-stone-700 rounded-lg shadow-sm transition-transform hover:scale-105"
                      title="Move Right/Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {/* Replace Button */}
                  <button
                    type="button"
                    onClick={() => triggerReplace(index)}
                    className="p-1.5 bg-white/90 hover:bg-white text-amber-700 rounded-lg shadow-sm transition-transform hover:scale-105"
                    title="Replace Image"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(index)}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-transform hover:scale-105"
                    title="Delete Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* 2. Active Upload Queue Cards */}
          {activeUploads.map(item => (
            <div
              key={item.id}
              className={`relative rounded-xl overflow-hidden border-2 aspect-square flex flex-col items-center justify-center p-3 bg-stone-50 transition-all ${
                item.stage === 'error' ? 'border-red-300 bg-red-50/50' : 'border-amber-300'
              }`}
            >
              {/* Thumbnail background with overlay */}
              <img
                src={item.previewUrl}
                alt="Uploading preview"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />

              <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-2 p-1">
                {item.stage === 'error' ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-red-700 line-clamp-2 px-1">
                      {item.errorMessage || 'Upload failed'}
                    </span>
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRetry(item.id)}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelOrRemoveUpload(item.id)}
                        className="p-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs rounded-md"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-full bg-amber-100/90 backdrop-blur-sm flex items-center justify-center text-amber-700 shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>

                    <div className="w-full space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-stone-700 px-0.5">
                        <span className="capitalize">
                          {item.stage === 'validating' ? 'Checking...' : item.stage === 'compressing' ? 'Optimizing...' : 'Uploading'}
                        </span>
                        <span>{item.progress}%</span>
                      </div>
                      {/* Dynamic Progress Bar */}
                      <div className="w-full bg-stone-200/80 rounded-full h-1.5 overflow-hidden shadow-inner">
                        <div
                          className="bg-amber-600 h-full rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCancelOrRemoveUpload(item.id)}
                      className="text-[10px] text-stone-500 hover:text-stone-800 underline mt-1"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dropzone / Button */}
      {images.length < maxImages && (
        <div
          onDragOver={e => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={e => {
            e.preventDefault();
            setDragOver(false);
          }}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            handleFilesSelected(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-amber-500 bg-amber-50/80 scale-[1.01]'
              : 'border-stone-300 bg-stone-50/70 hover:bg-stone-100/80 hover:border-stone-400'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-stone-200 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-stone-800">
              <span className="text-amber-600 hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-stone-500">
              JPG, PNG, WebP up to 20MB (Auto-compressed & optimized)
            </p>
            <p className="text-[11px] text-stone-400 font-medium">
              {images.length} of {maxImages} images uploaded
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
