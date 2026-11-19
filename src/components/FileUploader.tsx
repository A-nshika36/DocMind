import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { uploadDocumentFile } from '../services/api.js';
import { DocumentItem } from '../types/index.js';

interface FileUploaderProps {
  onUploadSuccess: (doc: DocumentItem) => void;
  onNavigateToDoc?: (doc: DocumentItem) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadSuccess,
  onNavigateToDoc,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<DocumentItem | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    const name = file.name.toLowerCase();
    const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
    const isTxt = name.endsWith('.txt') || file.type === 'text/plain';

    if (!isPdf && !isTxt) {
      return 'Unsupported file format. Please upload ONLY PDF (.pdf) or TXT (.txt) documents.';
    }

    if (file.size === 0) {
      return 'The selected file is empty. Please select a valid document with content.';
    }

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      return 'File size exceeds the 50MB limit. Please upload a smaller document.';
    }

    return null;
  };

  const handleFileChange = (file: File) => {
    setUploadError(null);
    setUploadedDoc(null);
    const errorMsg = validateFile(file);

    if (errorMsg) {
      setUploadError(errorMsg);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(20);

    try {
      // Simulated progressive indicator for pleasant user feedback while server extracts text
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressTimer);
            return 85;
          }
          return prev + 15;
        });
      }, 150);

      const response = await uploadDocumentFile(selectedFile);
      clearInterval(progressTimer);
      setUploadProgress(100);
      setUploadedDoc(response.document);
      onUploadSuccess(response.document);
    } catch (err: any) {
      setUploadError(err.message || 'Something went wrong while processing your document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadedDoc(null);
    setUploadError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1E2929]">
          Upload your PDF or TXT document
        </h2>
        <p className="text-sm text-[#718096] mt-1">
          Supported formats: <strong className="text-[#0D7466] font-semibold">PDF, TXT</strong> (Max 50MB)
        </p>
      </div>

      {/* Hidden input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
        accept=".pdf,.txt,application/pdf,text/plain"
        className="hidden"
      />

      {/* Drop Zone */}
      {!uploadedDoc && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-[#0D7466] bg-[#E6F4F1]/50 scale-[0.99]'
              : 'border-[#CBD5E1] hover:border-[#0D7466]/60 hover:bg-[#FBFBFA]'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] text-[#0D7466] mx-auto flex items-center justify-center mb-4 shadow-xs">
            <UploadCloud className="w-8 h-8" />
          </div>
          <p className="text-base font-semibold text-[#1E2929]">
            {selectedFile ? 'Change selected file' : 'Click to upload or drag & drop'}
          </p>
          <p className="text-xs text-[#718096] mt-1">
            Standard text-based PDF or plain TXT files
          </p>
        </div>
      )}

      {/* Selected File Details */}
      {selectedFile && !uploadedDoc && (
        <div className="mt-5 p-4 rounded-xl bg-[#F7F7F5] border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E6F4F1] text-[#0D7466] flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {selectedFile.name.endsWith('.pdf') ? 'PDF' : 'TXT'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1E2929] truncate">{selectedFile.name}</p>
              <div className="flex items-center gap-2 text-xs text-[#718096]">
                <span>Type: {selectedFile.name.endsWith('.pdf') ? 'PDF Document' : 'Text File'}</span>
                <span>•</span>
                <span>Size: {formatFileSize(selectedFile.size)}</span>
              </div>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-medium text-[#4A5568]">
                <span>Reading & extracting text from document...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0D7466] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action button */}
          {!isUploading && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleUpload}
                className="flex-1 py-2.5 px-4 bg-[#0D7466] hover:bg-[#0A5C51] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                Upload & Process Document
              </button>
              <button
                onClick={handleReset}
                className="py-2.5 px-4 bg-[#FFFFFF] border border-[#CBD5E1] hover:bg-[#F7F7F5] text-sm font-medium text-[#4A5568] rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium leading-relaxed">
            {uploadError}
          </div>
        </div>
      )}

      {/* Success View */}
      {uploadedDoc && (
        <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-emerald-900">
            Document Uploaded Successfully!
          </h3>
          <p className="text-sm text-emerald-700 mt-1">
            "{uploadedDoc.file_name}" is ready for learning, AI summaries, Q&A, and practice MCQs.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onNavigateToDoc && (
              <button
                onClick={() => onNavigateToDoc(uploadedDoc)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Start Learning Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 font-medium text-sm transition-colors"
            >
              Upload Another Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
