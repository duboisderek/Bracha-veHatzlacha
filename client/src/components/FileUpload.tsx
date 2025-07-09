import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, Image, FileText, X, Check, AlertCircle } from "lucide-react";

interface FileUploadProps {
  onFileUpload?: (fileUrl: string, fileName: string) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // en MB
  multiple?: boolean;
  className?: string;
}

interface FilePreviewProps {
  file: File;
  url?: string;
  onRemove: () => void;
}

export function FileUpload({ 
  onFileUpload, 
  acceptedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt'],
  maxFileSize = 10,
  multiple = false,
  className = ""
}: FileUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{file: File, url?: string, uploading: boolean, progress: number}>>([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Le fichier ${file.name} dépasse la taille maximale de ${maxFileSize}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.some(type => type.toLowerCase() === fileExtension)) {
      return `Type de fichier non supporté: ${fileExtension}`;
    }

    return null;
  };

  const uploadFile = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        setUploadedFiles(prev => prev.map((item, i) => 
          i === index 
            ? { ...item, url: data.url, uploading: false, progress: 100 }
            : item
        ));

        if (onFileUpload) {
          onFileUpload(data.url, file.name);
        }

        toast({
          title: "Succès",
          description: `${file.name} téléchargé avec succès`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du téléchargement');
      }
    } catch (error) {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
      toast({
        title: "Erreur",
        description: `Impossible de télécharger ${file.name}: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList) return;

    const filesArray = Array.from(fileList);
    
    if (!multiple && filesArray.length > 1) {
      toast({
        title: "Erreur",
        description: "Un seul fichier autorisé",
        variant: "destructive"
      });
      return;
    }

    // Validate all files first
    for (const file of filesArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive"
        });
        return;
      }
    }

    // Add files to state
    const newFiles = filesArray.map(file => ({
      file,
      uploading: true,
      progress: 0
    }));

    setUploadedFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);
    setIsUploading(true);

    // Upload each file
    newFiles.forEach((fileObj, index) => {
      const actualIndex = multiple ? uploadedFiles.length + index : index;
      uploadFile(fileObj.file, actualIndex);
    });

    setIsUploading(false);
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

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`w-full ${className}`}>
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
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Glissez et déposez vos fichiers ici
        </p>
        <p className="text-sm text-gray-500 mb-4">
          ou cliquez pour sélectionner
        </p>
        <p className="text-xs text-gray-400">
          Types acceptés: {acceptedTypes.join(', ')} | Taille max: {maxFileSize}MB
        </p>
      </motion.div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadedFiles.map((fileObj, index) => (
            <FilePreview
              key={`${fileObj.file.name}-${index}`}
              file={fileObj.file}
              url={fileObj.url}
              uploading={fileObj.uploading}
              progress={fileObj.progress}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FilePreview({ 
  file, 
  url, 
  uploading = false, 
  progress = 0, 
  onRemove 
}: FilePreviewProps & { uploading?: boolean; progress?: number }) {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <Image className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'txt':
        return <FileText className="w-5 h-5 text-gray-500" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
    >
      {getFileIcon(file.name)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        
        {uploading && (
          <div className="mt-2">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-gray-500 mt-1">Téléchargement... {progress}%</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {url && !uploading && (
          <Check className="w-4 h-4 text-green-500" />
        )}
        {uploading && (
          <AlertCircle className="w-4 h-4 text-orange-500 animate-pulse" />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="p-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}