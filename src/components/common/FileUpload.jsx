import { forwardRef } from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';

/**
 * FileUpload Component with Render Props Pattern
 * 
 * Usage:
 * <FileUpload
 *   error={error}
 *   onChange={onChange}
 *   renderPreview={(files, onRemove) => <CustomPreview files={files} onRemove={onRemove} />}
 * />
 */
const FileUpload = forwardRef(function FileUpload(
  {
    label,
    name,
    onChange,
    error,
    helpText,
    required = false,
    disabled = false,
    maxFiles = 3,
    maxSize = 5242880, // 5MB
    accept = { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    compressImages = true,
    compressionOptions = { maxWidth: 1600, maxHeight: 1600, quality: 0.8 },
    className,
    value = [],
    renderPreview, // The render prop
  },
  ref
) {
  const compressImage = async (file) => {
    if (!file.type.startsWith('image/')) return file;

    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(file);
        image.onload = () => {
          URL.revokeObjectURL(url);
          resolve(image);
        };
        image.onerror = (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        };
        image.src = url;
      });

      const { maxWidth, maxHeight, quality } = compressionOptions;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', quality);
      });

      if (!blob) return file;
      return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
    } catch (error) {
      return file;
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (!onChange) return;

      const processedFiles = await Promise.all(
        acceptedFiles.map((file) => (compressImages ? compressImage(file) : file))
      );

      // Append new files up to the limit
      const newFiles = [...value, ...processedFiles].slice(0, maxFiles);
      onChange(newFiles);
    },
    maxFiles,
    maxSize,
    accept,
    disabled
  });

  const handleRemove = (idxToRemove) => {
    if (onChange) {
      onChange(value.filter((_, i) => i !== idxToRemove));
    }
  };

  return (
    <div className={clsx('form-field', className)}>
      {label && (
        <label className={clsx('form-label', { 'form-label-required': required })}>
          {label}
        </label>
      )}
      
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
          {
            'border-primary-500 bg-primary-50': isDragActive,
            'border-surface-300 hover:border-primary-300 bg-white': !isDragActive && !error,
            'border-error-500 bg-error-50': error,
            'opacity-50 cursor-not-allowed': disabled,
          }
        )}
      >
        <input {...getInputProps()} ref={ref} name={name} />
        <p className="text-sm text-gray-600">
          {isDragActive ? "Drop files here..." : "Drag & drop files here, or click to select"}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          PDF, JPG, PNG up to 5MB (Max {maxFiles} files)
        </p>
      </div>

      {error && <p className="text-xs text-error-500 mt-1.5">{error}</p>}
      {helpText && !error && <p className="form-help-text">{helpText}</p>}

      {/* Execute Render Prop for custom preview UI */}
      {renderPreview && value.length > 0 && renderPreview(value, handleRemove)}
    </div>
  );
});

export default FileUpload;
