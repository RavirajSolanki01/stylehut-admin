"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type ImageItem = {
  id: string;
  url: string;
  file?: File;
  isInitial?: boolean;
};

type ImageUploadProps = {
  name: string;
  value: (File | string)[];
  onChange: (files: (File | string)[]) => void;
  onBlur?: () => void;
  className?: string;
  label?: string;
  maxImages?: number;
  maxSizeMB?: number;
  error?: string;
  touched?: boolean;
  onDeleteImage?: (deleteImageURL: string) => void;
};

export const ImageUpload = ({
  name,
  value,
  onChange,
  onBlur,
  className,
  label = "Upload Images",
  maxImages = 8,
  maxSizeMB = 5,
  error,
  touched,
  onDeleteImage,
}: ImageUploadProps) => {
  const [images, setImages] = useState<ImageItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateParent = useCallback(
    (items: ImageItem[]) => {
      const newValue = items.map((item) => item.file || item.url);
      onChange(newValue);
      if (onBlur) onBlur();
    },
    [onChange, onBlur],
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      if (images.length + files.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const newImages: ImageItem[] = [];

      Array.from(files).forEach((file) => {
        if (!["image/jpeg", "image/png"].includes(file.type)) {
          toast.error("Only JPG/JPEG/PNG files allowed");
          return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`File size must be less than ${maxSizeMB}MB`);
          return;
        }

        newImages.push({
          id: Math.random().toString(36).substring(2, 9),
          url: URL.createObjectURL(file),
          file,
        });
      });

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages].slice(0, maxImages);
        setImages(updatedImages);
        updateParent(updatedImages);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [images, maxImages, maxSizeMB, updateParent],
  );

  const handleDeleteImage = useCallback(
    (id: string) => {
      const imageToDelete = images.find((img) => img.id === id);
      if (!imageToDelete) return;

      if (!imageToDelete.file && onDeleteImage) {
        onDeleteImage(imageToDelete.url);
      }

      if (!imageToDelete.isInitial && imageToDelete.file) {
        URL.revokeObjectURL(imageToDelete.url);
      }

      const newImages = images.filter((img) => img.id !== id);
      setImages(newImages);
      updateParent(newImages);
    },
    [images, updateParent],
  );

  useEffect(() => {
    setImages(
      value.map((item) => ({
        id: Math.random().toString(36).substring(2, 9),
        url: typeof item === "string" ? item : URL.createObjectURL(item),
        file: typeof item === "string" ? undefined : item,
        isInitial: typeof item === "string",
      })),
    );
  }, [value]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-white">
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-3">
        {images.map((image) => (
          <div key={image.id} className="relative h-24 w-24 rounded-md border">
            <Image
              src={image.url}
              alt="Preview"
              className="!h-full !w-full object-cover"
              height={24}
              width={24}
            />
            <button
              type="button"
              onClick={() => handleDeleteImage(image.id)}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border dark:border-dark-3 dark:hover:border-primary"
          >
            <span className="text-2xl">+</span>
            <span className="text-xs">Add Image</span>
            <input
              ref={fileInputRef}
              type="file"
              name={name}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {images.length}/{maxImages} images (max {maxSizeMB}MB each)
      </p>

      {touched && error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
