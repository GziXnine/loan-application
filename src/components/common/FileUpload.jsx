import { forwardRef } from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';

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
    className,
  },
  ref
) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (onChange) onChange(acceptedFiles);
    },
    maxFiles,
    maxSize,
    accept,
    disabled
  });

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
    </div>
  );
});

export default FileUpload;
