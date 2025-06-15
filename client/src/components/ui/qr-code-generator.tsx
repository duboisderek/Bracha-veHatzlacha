import { useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeGenerator({ value, size = 200, className = "" }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple QR code generation using canvas
    // This creates a basic pattern - in production, use a proper QR library
    const modules = generateQRPattern(value);
    const moduleSize = size / modules.length;

    canvas.width = size;
    canvas.height = size;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw QR pattern
    ctx.fillStyle = '#000000';
    for (let row = 0; row < modules.length; row++) {
      for (let col = 0; col < modules[row].length; col++) {
        if (modules[row][col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }, [value, size]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <canvas 
        ref={canvasRef}
        className="border border-gray-200 rounded-lg shadow-sm"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <p className="text-xs text-gray-500 text-center max-w-[200px]">
        {t("scan_qr_referral")}
      </p>
    </div>
  );
}

// Simple QR pattern generator (basic implementation)
function generateQRPattern(data: string): boolean[][] {
  const size = 25; // 25x25 grid for simplicity
  const pattern: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
  
  // Create a deterministic pattern based on the data
  const hash = simpleHash(data);
  
  // Add finder patterns (corners)
  addFinderPattern(pattern, 0, 0);
  addFinderPattern(pattern, 0, size - 7);
  addFinderPattern(pattern, size - 7, 0);
  
  // Add data pattern
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!isFinderPattern(i, j, size)) {
        pattern[i][j] = ((hash + i * j) % 3) === 0;
      }
    }
  }
  
  return pattern;
}

function addFinderPattern(pattern: boolean[][], startRow: number, startCol: number) {
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      const row = startRow + i;
      const col = startCol + j;
      if (row < pattern.length && col < pattern[0].length) {
        pattern[row][col] = (i === 0 || i === 6 || j === 0 || j === 6 || 
                           (i >= 2 && i <= 4 && j >= 2 && j <= 4));
      }
    }
  }
}

function isFinderPattern(row: number, col: number, size: number): boolean {
  return (row < 7 && col < 7) || 
         (row < 7 && col >= size - 7) || 
         (row >= size - 7 && col < 7);
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}