import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, X, Image, FileText, Paperclip } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File, url: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  multiple?: boolean;
}

export function FileUpload({ 
  onFileSelect, 
  acceptedTypes = ['image/*', '.pdf', '.txt', '.doc', '.docx'],
  maxSize = 5,
  multiple = false
}: FileUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: `La taille maximale autorisée est ${maxSize}MB`,
        variant: "destructive"
      });
      return false;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    });

    if (!isValidType) {
      toast({
        title: "Type de fichier non supporté",
        description: `Types acceptés: ${acceptedTypes.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        onFileSelect(file, result.url);
        toast({
          title: "Fichier téléchargé",
          description: `${file.name} a été téléchargé avec succès`,
        });
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le fichier",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const filesArray = Array.from(files);
    if (!multiple && filesArray.length > 1) {
      toast({
        title: "Sélection multiple non autorisée",
        description: "Veuillez sélectionner un seul fichier",
        variant: "destructive"
      });
      return;
    }

    filesArray.forEach(uploadFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return Image;
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return FileText;
    } else {
      return File;
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <motion.div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isUploading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-500">Téléchargement en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 bg-gray-100 rounded-full">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Glissez-déposez vos fichiers ici
              </p>
              <p className="text-xs text-gray-500">
                ou cliquez pour sélectionner
              </p>
            </div>
            <div className="text-xs text-gray-400">
              <p>Types acceptés: {acceptedTypes.join(', ')}</p>
              <p>Taille max: {maxSize}MB</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface FilePreviewProps {
  file: File;
  url: string;
  onRemove: () => void;
}

export function FilePreview({ file, url, onRemove }: FilePreviewProps) {
  const FileIcon = (() => {
    const extension = file.name.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return Image;
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return FileText;
    } else {
      return File;
    }
  })();

  const isImage = file.type.startsWith('image/');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative group"
    >
      <div className="flex items-center p-3 bg-gray-50 rounded-lg border">
        <div className="flex-shrink-0 mr-3">
          {isImage ? (
            <img
              src={url}
              alt={file.name}
              className="w-10 h-10 object-cover rounded"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
              <FileIcon className="w-5 h-5 text-gray-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}