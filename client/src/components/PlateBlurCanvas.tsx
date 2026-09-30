import React, { useRef, useEffect, useState } from 'react';
import { EyeOff, RotateCcw, Check, Sparkles, Shield } from 'lucide-react';

interface PlateBlurCanvasProps {
  imageSrc: string;
  onBlurredImageReady: (blob: Blob) => void;
}

export const PlateBlurCanvas: React.FC<PlateBlurCanvasProps> = ({
  imageSrc,
  onBlurredImageReady
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [blurRegions, setBlurRegions] = useState<{ x: number; y: number; w: number; h: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
  }, [imageSrc]);

  // Re-render canvas whenever blurRegions change
  useEffect(() => {
    renderCanvas();
  }, [blurRegions, currentBox]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to fit container while maintaining aspect ratio
    const maxWidth = 480;
    const scale = Math.min(1, maxWidth / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // 1. Draw base image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 2. Apply pixelation/blur to regions
    for (const r of blurRegions) {
      applyPixelate(ctx, r.x, r.y, r.w, r.h, 12);
      // Draw subtle privacy outline
      ctx.strokeStyle = '#B3321E';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.setLineDash([]);
    }

    // 3. Draw active drawing box
    if (currentBox) {
      ctx.strokeStyle = '#1B6B8A';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h);
    }

    // Export current blob
    canvas.toBlob((blob) => {
      if (blob) onBlurredImageReady(blob);
    }, 'image/jpeg', 0.9);
  };

  const applyPixelate = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pixelSize = 10) => {
    try {
      const imgData = ctx.getImageData(x, y, w, h);
      const data = imgData.data;

      for (let py = 0; py < h; py += pixelSize) {
        for (let px = 0; px < w; px += pixelSize) {
          const redIndex = (py * w + px) * 4;
          const r = data[redIndex];
          const g = data[redIndex + 1];
          const b = data[redIndex + 2];

          for (let dy = 0; dy < pixelSize && py + dy < h; dy++) {
            for (let dx = 0; dx < pixelSize && px + dx < w; dx++) {
              const targetIdx = ((py + dy) * w + (px + dx)) * 4;
              data[targetIdx] = r;
              data[targetIdx + 1] = g;
              data[targetIdx + 2] = b;
            }
          }
        }
      }
      ctx.putImageData(imgData, x, y);
    } catch (e) {
      // Fallback simple solid rectangle if cors/taint
      ctx.fillStyle = '#12262B';
      ctx.fillRect(x, y, w, h);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const boxX = Math.min(startPos.x, x);
    const boxY = Math.min(startPos.y, y);
    const boxW = Math.abs(x - startPos.x);
    const boxH = Math.abs(y - startPos.y);

    setCurrentBox({ x: boxX, y: boxY, w: boxW, h: boxH });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentBox && currentBox.w > 10 && currentBox.h > 10) {
      setBlurRegions([...blurRegions, currentBox]);
    }
    setIsDrawing(false);
    setStartPos(null);
    setCurrentBox(null);
  };

  const handleAutoObfuscate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Auto preset typical vehicle number plate lower region & face upper center
    const w = canvas.width;
    const h = canvas.height;
    const autoPlate = { x: w * 0.3, y: h * 0.72, w: w * 0.4, h: h * 0.18 };
    setBlurRegions([...blurRegions, autoPlate]);
  };

  const handleReset = () => {
    setBlurRegions([]);
    setCurrentBox(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-ink flex items-center gap-1.5">
          <EyeOff className="w-3.5 h-3.5 text-signal" />
          <span>Privacy Obfuscation (DPDP Act 2023)</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoObfuscate}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-signal-light text-signal hover:bg-signal/20 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>Auto-Blur Plate</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate hover:bg-paper transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="relative border border-hairline rounded-card overflow-hidden bg-ink/5 flex justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="cursor-crosshair max-w-full block"
          title="Drag over vehicle plates or faces to pixelate"
        />
      </div>

      <p className="text-[11px] text-slate flex items-center gap-1">
        <Shield className="w-3 h-3 text-emerald-600 flex-shrink-0" />
        <span>Click and drag over faces or number plates to redact sensitive biometrics before upload.</span>
      </p>
    </div>
  );
};
