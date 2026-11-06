// src/components/common/ImageUpload.tsx
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { cmsService } from '../../services/cmsService';

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  maxSizeMB?: number;
  allowedFormats?: string[];
  isLogo?: boolean;
  aspectRatioHint?: string;
}

const DEFAULT_ALLOWED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif'];

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = '',
  onChange,
  label = 'Upload Image',
  description = 'Supports PNG, JPG, WebP, SVG, GIF (up to 10MB)',
  maxSizeMB = 10,
  allowedFormats = DEFAULT_ALLOWED,
  isLogo = false,
  aspectRatioHint,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Format check
    const mime = file.type.toLowerCase();
    const isAllowed = allowedFormats.some((fmt) => mime === fmt || file.name.toLowerCase().endsWith(fmt.replace('image/', '.')));
    if (!isAllowed) {
      setErrorMessage(`Invalid format. Allowed: PNG, JPG, JPEG, WEBP, SVG, GIF`);
      return false;
    }

    // Size check
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage(`File exceeds ${maxSizeMB}MB limit (actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
      return false;
    }

    return true;
  };

  const processUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(20);

    const progressTimer = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 85) {
          clearInterval(progressTimer);
          return 85;
        }
        return p + 20;
      });
    }, 80);

    try {
      const media = await cmsService.uploadMedia(file, isLogo ? 'logos' : 'general', file.name);
      clearInterval(progressTimer);
      setUploadProgress(100);

      const finalUrl = media.url;
      onChange(finalUrl);
      setSuccessMessage(`Successfully uploaded "${file.name}"!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      clearInterval(progressTimer);
      setErrorMessage(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 400);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSuccessMessage('Image removed.');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handleApplyManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    onChange(manualUrl.trim());
    setManualUrl('');
    setShowUrlInput(false);
    setSuccessMessage('Custom image URL applied.');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
            {label}
          </label>
          {aspectRatioHint && (
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {aspectRatioHint}
            </span>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedFormats.join(',')}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Upload & Preview Container */}
      {value ? (
        <div
          style={{
            position: 'relative',
            borderRadius: '10px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#F8FAFC',
            overflow: 'hidden',
            padding: isLogo ? '1.5rem' : '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: isLogo ? '120px' : '180px',
          }}
        >
          {/* Image Preview */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxHeight: isLogo ? '90px' : '260px',
              overflow: 'hidden',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              boxShadow: 'inset 0 0 0 1px #F1F5F9',
              padding: isLogo ? '0.75rem' : '0',
            }}
          >
            <img
              src={value}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: isLogo ? '80px' : '240px',
                objectFit: isLogo ? 'contain' : 'cover',
                borderRadius: '6px',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394A3B8" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
              }}
            />
          </div>

          {/* Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: '0.75rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid #E2E8F0',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748B',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '220px',
                fontFamily: 'monospace',
              }}
              title={value}
            >
              {value.startsWith('data:') ? 'Inline Embedded Asset' : value}
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  color: '#4338CA',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} className={isUploading ? 'animate-spin' : ''} />
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: '#FFE4E6',
                  border: '1px solid #FECDD3',
                  color: '#BE123C',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <X size={13} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.5rem',
            borderRadius: '10px',
            border: `2px dashed ${isDragging ? '#18181B' : '#CBD5E1'}`,
            backgroundColor: isDragging ? '#F4F4F5' : '#F8FAFC',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease-in-out',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: isDragging ? '#E4E4E7' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            {isUploading ? (
              <RefreshCw size={22} color="#18181B" style={{ animation: 'spin 1s linear infinite' }} />
            ) : isLogo ? (
              <ImageIcon size={22} color="#18181B" />
            ) : (
              <Upload size={22} color="#18181B" />
            )}
          </div>

          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.25rem' }}>
            {isUploading ? 'Processing & uploading...' : 'Click to select or drag and drop'}
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: '320px' }}>
            {description}
          </div>

          {/* Direct URL toggle button */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowUrlInput(!showUrlInput);
            }}
            style={{
              marginTop: '0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#18181B',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
            }}
          >
            <LinkIcon size={12} />
            <span>{showUrlInput ? 'Hide URL field' : 'Or paste an image URL directly'}</span>
          </div>
        </div>
      )}

      {/* Manual URL Input dropdown */}
      {showUrlInput && (
        <form
          onSubmit={handleApplyManualUrl}
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: '#F1F5F9',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
          }}
        >
          <input
            type="url"
            placeholder="https://example.com/your-image.jpg"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            style={{
              flex: 1,
              padding: '0.4rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '0.8125rem',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: '#18181B',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </form>
      )}

      {/* Upload Progress Bar */}
      {isUploading && (
        <div style={{ width: '100%', backgroundColor: '#E2E8F0', height: '6px', borderRadius: '3px', overflow: 'hidden', marginTop: '0.25rem' }}>
          <div
            style={{
              width: `${uploadProgress}%`,
              backgroundColor: '#18181B',
              height: '100%',
              transition: 'width 0.2s ease',
            }}
          />
        </div>
      )}

      {/* Feedback Messages */}
      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#BE123C',
            backgroundColor: '#FFE4E6',
            padding: '0.4rem 0.65rem',
            borderRadius: '6px',
            border: '1px solid #FECDD3',
          }}
        >
          <AlertCircle size={14} color="#BE123C" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#047857',
            backgroundColor: '#ECFDF5',
            padding: '0.4rem 0.65rem',
            borderRadius: '6px',
            border: '1px solid #A7F3D0',
          }}
        >
          <CheckCircle2 size={14} color="#047857" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};
