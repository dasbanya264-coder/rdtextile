import React from 'react';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export const compressImage = (file: File, maxWidth = 1920): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(newFile);
        } else {
          resolve(file);
        }
      }, 'image/webp', 0.8);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
};

export const compressImageToBase64 = (file: File, targetMaxWidth = 1800): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If the image is already lightweight (<= 320KB), keep 100% RAW original quality with ZERO loss!
    if (file.size <= 320 * 1024) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
      return;
    }

    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      
      const maxWidth = targetMaxWidth;
      let width = img.width;
      let height = img.height;
      
      // Keep true aspect ratio and high resolution (up to 1800-2000px)
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Failed to process image"));
        return;
      }

      // Preserve crisp lines and fine textile details using high quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Prefer WebP for superior lossless/near-lossless fidelity at smaller payload, fallback to high-quality JPEG
      let quality = 0.92;
      let format = 'image/webp';
      let dataUrl = canvas.toDataURL(format, quality);

      if (!dataUrl.startsWith('data:image/webp')) {
        format = 'image/jpeg';
        dataUrl = canvas.toDataURL(format, quality);
      }
      
      // Ensure the base64 string comfortably fits within Firestore's 1MB per-document limit (~280KB-320KB per photo)
      // Never lower quality below 0.82 to avoid any pixelation or artifacts
      while (dataUrl.length > 330000 && quality > 0.82) {
        quality -= 0.03;
        dataUrl = canvas.toDataURL(format, quality);
      }
      
      // If still slightly large (e.g. extremely complex pattern), scale slightly to 1400px with high quality
      if (dataUrl.length > 350000 && width > 1400) {
        const scale = 1400 / width;
        canvas.width = 1400;
        canvas.height = Math.round(height * scale);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL(format, 0.88);
      }
      
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = objectUrl;
  });
};

export const createThumbnailFromBase64 = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str.startsWith('data:image')) {
      resolve(base64Str);
      return;
    }
    // If it's already small enough, don't bother
    if (base64Str.length < 50000) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 150;
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      } else {
        resolve(base64Str);
        return;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
};

export const triggerCartAnimation = (e: React.MouseEvent<HTMLElement> | MouseEvent) => {
  const isMobile = window.innerWidth < 768;
  const cartIcon = document.getElementById(isMobile ? 'cart-icon-mobile' : 'cart-icon-desktop');
  
  if (!cartIcon) return;

  const cartRect = cartIcon.getBoundingClientRect();
  const btnRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  
  const emoji = document.createElement('div');
  // You can also use other emojis like 🛍️, 🎁, ✨, 😍
  emoji.innerText = '🛍️'; 
  emoji.style.position = 'fixed';
  emoji.style.left = `${btnRect.left + btnRect.width / 2}px`;
  emoji.style.top = `${btnRect.top + btnRect.height / 2}px`;
  emoji.style.fontSize = '30px';
  emoji.style.pointerEvents = 'none';
  emoji.style.zIndex = '99999';
  emoji.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
  emoji.style.transform = 'translate(-50%, -50%) scale(1)';
  emoji.style.opacity = '1';
  emoji.style.textShadow = '0 4px 10px rgba(0,0,0,0.3)';

  document.body.appendChild(emoji);

  // Small delay to ensure transition applies
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      emoji.style.left = `${cartRect.left + cartRect.width / 2}px`;
      emoji.style.top = `${cartRect.top + cartRect.height / 2}px`;
      emoji.style.transform = 'translate(-50%, -50%) scale(0.3) rotate(360deg)';
      emoji.style.opacity = '0';
    });
  });

  setTimeout(() => {
    if (document.body.contains(emoji)) {
      document.body.removeChild(emoji);
    }
  }, 800);
};
