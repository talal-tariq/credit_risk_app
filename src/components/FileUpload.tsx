import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useStore } from '../store/useStore';
import clsx from 'clsx';

const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760', 10);
const ALLOWED_TYPES = (import.meta.env.VITE_ALLOWED_FILE_TYPES || '.csv,.xlsx,.xls').split(',');

export function FileUpload() {
  const { uploadedFile, setUploadedFile, setRawFile, clearUploadedFile } =
    useStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setUploadedFile({
          id: '',
          name: file.name,
          size: file.size,
          type: file.type,
          uploadProgress: 0,
          status: 'error',
          errorMessage: `File size exceeds ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB limit`,
        });
        setRawFile(null);
        return;
      }

      // Store the raw file for later submission with form data
      setRawFile(file);
      
      // Set file metadata (ready state, will be uploaded with form submission)
      setUploadedFile({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 100,
        status: 'completed',
      });
    },
    [setUploadedFile, setRawFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: uploadedFile?.status === 'uploading',
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <label className="label">
        Financial Data File
        <span className="text-gray-400 font-normal ml-1">(required)</span>
      </label>

      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={clsx(
            'dropzone cursor-pointer',
            isDragActive && 'dropzone-active'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-800 font-medium">
                {isDragActive ? 'Drop file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                or <span className="text-[#1a5a7a]">browse</span> to select
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Supported: {ALLOWED_TYPES.join(', ')} (max {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="card p-4">
          <div className="flex items-start gap-3">
            {/* File Icon */}
            <div
              className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                uploadedFile.status === 'error' ? 'bg-red-500/20' : 'bg-accent/20'
              )}
            >
              {uploadedFile.status === 'uploading' ? (
                <svg className="w-5 h-5 text-[#1a5a7a] animate-spin-slow" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : uploadedFile.status === 'error' ? (
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{uploadedFile.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(uploadedFile.size)}</p>

              {uploadedFile.status === 'uploading' && (
                <div className="mt-2">
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${uploadedFile.uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{uploadedFile.uploadProgress}% uploaded</p>
                </div>
              )}

              {uploadedFile.status === 'error' && (
                <p className="text-xs text-red-400 mt-1">{uploadedFile.errorMessage}</p>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={clearUploadedFile}
              className="p-1.5 rounded-lg hover:bg-surface-light transition-colors"
              disabled={uploadedFile.status === 'uploading'}
            >
              <svg
                className="w-4 h-4 text-gray-400 hover:text-[#1a5a7a]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
