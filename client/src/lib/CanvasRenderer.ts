
import type { TextOverlay } from "@shared/schema";

interface RenderOptions {
  width: number;
  height: number;
  borderRadius: number;
  gap: number;
  textOverlay: TextOverlay | null;
  quality: number;
}

export async function renderCollageToBlob(
  images: { url: string; label: string }[],
  layout: string,
  options: RenderOptions
): Promise<Blob | null> {
  const { width, height, quality, textOverlay } = options;
  
  // Scale factor based on baseline preview width (800px)
  const baselineWidth = 800;
  const scale = width / baselineWidth;
  const borderRadius = options.borderRadius * scale;
  const gap = options.gap * scale;
  
  // Use OffscreenCanvas if available for better performance
  const canvas = typeof OffscreenCanvas !== 'undefined' 
    ? new OffscreenCanvas(width, height) 
    : document.createElement('canvas');
  
  if (canvas instanceof HTMLCanvasElement) {
    canvas.width = width;
    canvas.height = height;
  }
  
  const ctx = canvas.getContext('2d') as (CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D);
  if (!ctx) return null;

  // Enhance image quality settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Load all images first
  const loadedImages = await Promise.all(
    images.map(img => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = img.url;
      });
    })
  );

  const drawImageWithRadius = (
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ) => {
    ctx.save();
    
    // Create clipping path for border radius
    if (radius > 0) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.clip();
    }

    // Object-cover equivalent: Calculate scaling and cropping
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    
    let drawW, drawH, drawX, drawY;
    if (imgRatio > targetRatio) {
      drawH = img.height;
      drawW = img.height * targetRatio;
      drawX = (img.width - drawW) / 2;
      drawY = 0;
    } else {
      drawW = img.width;
      drawH = img.width / targetRatio;
      drawX = 0;
      drawY = (img.height - drawH) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH, x, y, w, h);
    ctx.restore();
  };

  const imageCount = loadedImages.length;

  // Replicate layout logic from CollagePreview.tsx
  switch (layout) {
    case "side-by-side": {
      const w = (width - gap) / 2;
      drawImageWithRadius(loadedImages[0], 0, 0, w, height, borderRadius);
      drawImageWithRadius(loadedImages[1], w + gap, 0, w, height, borderRadius);
      break;
    }
    case "stacked": {
      const h = (height - gap) / 2;
      drawImageWithRadius(loadedImages[0], 0, 0, width, h, borderRadius);
      drawImageWithRadius(loadedImages[1], 0, h + gap, width, h, borderRadius);
      break;
    }
    case "diagonal": {
      const w = (width - gap) / 2;
      const h = (height - gap) / 2;
      drawImageWithRadius(loadedImages[0], 0, 0, w, h, borderRadius);
      drawImageWithRadius(loadedImages[1], w + gap, h + gap, w, h, borderRadius);
      break;
    }
    case "overlap": {
      const w = width * 0.8;
      const h = height * 0.8;
      drawImageWithRadius(loadedImages[0], 0, 0, w, h, borderRadius);
      drawImageWithRadius(loadedImages[1], width * 0.2, height * 0.2, w, h, borderRadius);
      break;
    }
    case "triangle": {
      const h = (height - gap) / 2;
      const w = (width - gap) / 2;
      drawImageWithRadius(loadedImages[0], width * 0.25, 0, width * 0.5, h, borderRadius);
      drawImageWithRadius(loadedImages[1], 0, h + gap, w, h, borderRadius);
      drawImageWithRadius(loadedImages[2], w + gap, h + gap, w, h, borderRadius);
      break;
    }
    case "L-shape": {
      const w = (width - gap) / 2;
      const h = (height - gap) / 2;
      drawImageWithRadius(loadedImages[0], 0, 0, width, h, borderRadius);
      drawImageWithRadius(loadedImages[1], 0, h + gap, w, h, borderRadius);
      drawImageWithRadius(loadedImages[2], w + gap, h + gap, w, h, borderRadius);
      break;
    }
    case "horizontal": {
      const w = (width - 2 * gap) / 3;
      loadedImages.forEach((img, idx) => {
        drawImageWithRadius(img, idx * (w + gap), 0, w, height, borderRadius);
      });
      break;
    }
    case "vertical": {
      const h = (height - 2 * gap) / 3;
      loadedImages.forEach((img, idx) => {
        drawImageWithRadius(img, 0, idx * (h + gap), width, h, borderRadius);
      });
      break;
    }
    case "grid-2x2": {
      const w = (width - gap) / 2;
      const h = (height - gap) / 2;
      loadedImages.forEach((img, idx) => {
        const x = (idx % 2) * (w + gap);
        const y = Math.floor(idx / 2) * (h + gap);
        drawImageWithRadius(img, x, y, w, h, borderRadius);
      });
      break;
    }
    case "asymmetric": {
      if (imageCount === 4) {
        const colW = (width - 2 * gap) / 3;
        const rowH = (height - 2 * gap) / 3;
        drawImageWithRadius(loadedImages[0], 0, 0, 2 * colW + gap, 2 * rowH + gap, borderRadius);
        drawImageWithRadius(loadedImages[1], 2 * colW + 2 * gap, 0, colW, 2 * rowH + gap, borderRadius);
        drawImageWithRadius(loadedImages[2], 2 * colW + 2 * gap, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
        drawImageWithRadius(loadedImages[3], 0, 2 * rowH + 2 * gap, 2 * colW + gap, rowH, borderRadius);
      } else if (imageCount === 5) {
        const colW = (width - 2 * gap) / 3;
        const rowH = (height - 2 * gap) / 3;
        drawImageWithRadius(loadedImages[0], 0, 0, 2 * colW + gap, 2 * rowH + gap, borderRadius);
        drawImageWithRadius(loadedImages[1], 2 * colW + 2 * gap, 0, colW, 2 * rowH + gap, borderRadius);
        drawImageWithRadius(loadedImages[2], 2 * colW + 2 * gap, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
        drawImageWithRadius(loadedImages[3], colW + gap, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
        drawImageWithRadius(loadedImages[4], 0, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
      } else if (imageCount === 7) {
        const colW = (width - 3 * gap) / 4;
        const rowH = (height - 3 * gap) / 4;
        drawImageWithRadius(loadedImages[0], 0, 0, 2 * colW + gap, 2 * rowH + gap, borderRadius);
        drawImageWithRadius(loadedImages[1], 2 * colW + 2 * gap, 0, 2 * colW + gap, 3 * rowH + 2 * gap, borderRadius);
        drawImageWithRadius(loadedImages[2], 0, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
        drawImageWithRadius(loadedImages[3], colW + gap, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
        drawImageWithRadius(loadedImages[4], 0, 3 * rowH + 3 * gap, colW, rowH, borderRadius);
        drawImageWithRadius(loadedImages[5], colW + gap, 3 * rowH + 3 * gap, colW, rowH, borderRadius);
        drawImageWithRadius(loadedImages[6], 2 * colW + 2 * gap, 3 * rowH + 3 * gap, 2 * colW + gap, rowH, borderRadius);
      } else if (imageCount === 9) {
        const colW = (width - 2 * gap) / 3;
        const rowH = (height - 3 * gap) / 4;
        drawImageWithRadius(loadedImages[0], 0, 0, 2 * colW + gap, 2 * rowH + gap, borderRadius);
        drawImageWithRadius(loadedImages[1], 2 * colW + 2 * gap, 0, colW, 3 * rowH + 2 * gap, borderRadius);
        drawImageWithRadius(loadedImages[2], 0, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
        drawImageWithRadius(loadedImages[3], colW + gap, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
        drawImageWithRadius(loadedImages[4], 0, 3 * rowH + 3 * gap, colW, rowH, borderRadius);
        drawImageWithRadius(loadedImages[5], colW + gap, 3 * rowH + 3 * gap, colW, rowH, borderRadius);
        drawImageWithRadius(loadedImages[6], 2 * colW + 2 * gap, 3 * rowH + 3 * gap, colW, rowH, borderRadius);
        drawImageWithRadius(loadedImages[7], 0, 4 * rowH + 4 * gap, 2 * colW + gap, rowH, borderRadius);
        drawImageWithRadius(loadedImages[8], 2 * colW + 2 * gap, 4 * rowH + 4 * gap, colW, rowH, borderRadius);
      }
      break;
    }
    case "magazine": {
        if (imageCount === 4) {
          const colW = (width - gap) / 2;
          const rowH = (height - 2 * gap) / 3;
          drawImageWithRadius(loadedImages[0], 0, 0, colW, 2 * rowH + gap, borderRadius);
          drawImageWithRadius(loadedImages[1], colW + gap, 0, colW, rowH, borderRadius);
          drawImageWithRadius(loadedImages[2], colW + gap, rowH + gap, colW, rowH, borderRadius);
          drawImageWithRadius(loadedImages[3], 0, 2 * rowH + 2 * gap, width, rowH, borderRadius);
        } else if (imageCount === 5) {
          const colW = (width - 2 * gap) / 3;
          const rowH = (height - 2 * gap) / 3;
          drawImageWithRadius(loadedImages[0], 0, 0, colW, 2 * rowH + gap, borderRadius);
          drawImageWithRadius(loadedImages[1], colW + gap, 0, 2 * colW + gap, rowH, borderRadius);
          drawImageWithRadius(loadedImages[2], colW + gap, rowH + gap, 2 * colW + gap, rowH, borderRadius);
          drawImageWithRadius(loadedImages[3], 0, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
          drawImageWithRadius(loadedImages[4], colW + gap, 2 * rowH + 2 * gap, 2 * colW + gap, rowH, borderRadius);
        } else if (imageCount === 6) {
          const colW = (width - 2 * gap) / 3;
          const rowH = (height - 3 * gap) / 4;
          drawImageWithRadius(loadedImages[0], 0, 0, 2 * colW + gap, 2 * rowH + gap, borderRadius);
          drawImageWithRadius(loadedImages[1], 2 * colW + 2 * gap, 0, colW, 2 * rowH + gap, borderRadius);
          drawImageWithRadius(loadedImages[2], 0, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
          drawImageWithRadius(loadedImages[3], colW + gap, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
          drawImageWithRadius(loadedImages[4], 2 * colW + 2 * gap, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
          drawImageWithRadius(loadedImages[5], 0, 3 * rowH + 3 * gap, width, rowH, borderRadius);
        }
        break;
    }
    case "creative": {
        const colW = (width - 2 * gap) / 3;
        const rowH = (height - 2 * gap) / 3;
        if (imageCount === 4) {
          drawImageWithRadius(loadedImages[0], 0, 0, 2 * colW + gap, 2 * rowH + gap, borderRadius);
          drawImageWithRadius(loadedImages[1], 2 * colW + 2 * gap, 0, colW, height, borderRadius);
          drawImageWithRadius(loadedImages[2], 0, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
          drawImageWithRadius(loadedImages[3], colW + gap, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
        }
        break;
    }
    case "grid-2x3": {
      const w = (width - gap) / 2;
      const h = (height - 2 * gap) / 3;
      loadedImages.forEach((img, idx) => {
        const x = (idx % 2) * (w + gap);
        const y = Math.floor(idx / 2) * (h + gap);
        drawImageWithRadius(img, x, y, w, h, borderRadius);
      });
      break;
    }
    case "grid-3x2": {
      const w = (width - 2 * gap) / 3;
      const h = (height - gap) / 2;
      loadedImages.forEach((img, idx) => {
        const x = (idx % 3) * (w + gap);
        const y = Math.floor(idx / 3) * (h + gap);
        drawImageWithRadius(img, x, y, w, h, borderRadius);
      });
      break;
    }
    case "grid-3x3": {
      const w = (width - 2 * gap) / 3;
      const h = (height - 2 * gap) / 3;
      loadedImages.forEach((img, idx) => {
        const x = (idx % 3) * (w + gap);
        const y = Math.floor(idx / 3) * (h + gap);
        drawImageWithRadius(img, x, y, w, h, borderRadius);
      });
      break;
    }
    case "grid-2x4": {
      const w = (width - gap) / 2;
      const h = (height - 3 * gap) / 4;
      loadedImages.forEach((img, idx) => {
        const x = (idx % 2) * (w + gap);
        const y = Math.floor(idx / 2) * (h + gap);
        drawImageWithRadius(img, x, y, w, h, borderRadius);
      });
      break;
    }
    case "grid-4x2": {
      const w = (width - 3 * gap) / 4;
      const h = (height - gap) / 2;
      loadedImages.forEach((img, idx) => {
        const x = (idx % 4) * (w + gap);
        const y = Math.floor(idx / 4) * (h + gap);
        drawImageWithRadius(img, x, y, w, h, borderRadius);
      });
      break;
    }
    case "polaroid":
    case "polaroid-grid": {
        const cols = imageCount <= 2 ? 2 : imageCount <= 4 ? 2 : imageCount <= 6 ? 3 : 3;
        const rows = imageCount <= 2 ? 1 : imageCount <= 4 ? 2 : imageCount <= 6 ? 2 : 3;
        const w = (width - (cols - 1) * gap) / cols;
        const h = (height - (rows - 1) * gap) / rows;
        
        loadedImages.forEach((img, idx) => {
          const x = (idx % cols) * (w + gap);
          const y = Math.floor(idx / cols) * (h + gap);
          
          // Polaroid background
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = '#f3f4f6';
          ctx.strokeRect(x, y, w, h);
          
          // Polaroid image area
          const padding = w * 0.05;
          const imgH = h * 0.75;
          drawImageWithRadius(img, x + padding, y + padding, w - 2 * padding, imgH, 0);
          ctx.restore();
        });
        break;
    }
    case "circle-center": {
      const w = (width - gap) / 2;
      const h = (height - gap) / 2;
      drawImageWithRadius(loadedImages[0], 0, 0, w, h, borderRadius);
      drawImageWithRadius(loadedImages[1], w + gap, 0, w, h, borderRadius);
      drawImageWithRadius(loadedImages[3], 0, h + gap, w, h, borderRadius);
      
      // Center circle
      const centerW = width * 0.48;
      const centerH = height * 0.48;
      const x = (width - centerW) / 2;
      const y = (height - centerH) / 2;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + centerW / 2, y + centerH / 2, centerW / 2, 0, Math.PI * 2);
      ctx.clip();
      drawImageWithRadius(loadedImages[2], x, y, centerW, centerH, 0);
      ctx.restore();
      
      // Border for circle
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4 * (width / 800);
      ctx.beginPath();
      ctx.arc(x + centerW / 2, y + centerH / 2, centerW / 2, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "cross": {
      const colW = (width - 2 * gap) / 3;
      const rowH = (height - 2 * gap) / 3;
      drawImageWithRadius(loadedImages[0], 0, 0, width, rowH, borderRadius);
      drawImageWithRadius(loadedImages[1], 0, rowH + gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[2], colW + gap, rowH + gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[3], 2 * colW + 2 * gap, rowH + gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[4], 0, 2 * rowH + 2 * gap, width, rowH, borderRadius);
      break;
    }
    case "hexagon": {
      const w = (width - gap) / 2;
      const h = (height - 2 * gap) / 3;
      loadedImages.forEach((img, idx) => {
        const x = (idx % 2) * (w + gap);
        const y = Math.floor(idx / 2) * (h + gap);
        drawImageWithRadius(img, x, y, w, h, borderRadius);
      });
      break;
    }
    case "honeycomb": {
      const colW = (width - 3 * gap) / 4;
      const rowH = (height - 3 * gap) / 4;
      drawImageWithRadius(loadedImages[0], 0, 0, 2 * colW + gap, 2 * rowH + gap, borderRadius);
      drawImageWithRadius(loadedImages[1], 2 * colW + 2 * gap, 0, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[2], 3 * colW + 3 * gap, 0, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[3], 2 * colW + 2 * gap, rowH + gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[4], 0, 2 * rowH + 2 * gap, 2 * colW + gap, 2 * rowH + gap, borderRadius);
      drawImageWithRadius(loadedImages[5], 2 * colW + 2 * gap, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[6], 2 * colW + 2 * gap, 3 * rowH + 3 * gap, 2 * colW + gap, rowH, borderRadius);
      break;
    }
    case "octagon": {
      const colW = (width - 3 * gap) / 4;
      const rowH = (height - 3 * gap) / 4;
      drawImageWithRadius(loadedImages[0], colW + gap, 0, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[1], 2 * colW + 2 * gap, 0, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[2], 0, rowH + gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[3], 3 * colW + 3 * gap, rowH + gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[4], 0, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[5], 3 * colW + 3 * gap, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[6], colW + gap, 3 * rowH + 3 * gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[7], 2 * colW + 2 * gap, 3 * rowH + 3 * gap, colW, rowH, borderRadius);
      break;
    }
    case "mosaic": {
      const colW = (width - 3 * gap) / 4;
      const rowH = (height - 3 * gap) / 4;
      drawImageWithRadius(loadedImages[0], 0, 0, 2 * colW + gap, 2 * rowH + gap, borderRadius);
      drawImageWithRadius(loadedImages[1], 2 * colW + 2 * gap, 0, colW, 2 * rowH + gap, borderRadius);
      drawImageWithRadius(loadedImages[2], 3 * colW + 3 * gap, 0, colW, 2 * rowH + gap, borderRadius);
      drawImageWithRadius(loadedImages[3], 0, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[4], colW + gap, 2 * rowH + 2 * gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[5], 2 * colW + 2 * gap, 2 * rowH + 2 * gap, 2 * colW + gap, rowH, borderRadius);
      drawImageWithRadius(loadedImages[6], 0, 3 * rowH + 3 * gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[7], colW + gap, 3 * rowH + 3 * gap, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[8], 2 * colW + 2 * gap, 3 * rowH + 3 * gap, 2 * colW + gap, rowH, borderRadius);
      break;
    }
    case "circle": {
      const colW = (width - 2 * gap) / 3;
      const rowH = (height - 2 * gap) / 3;
      drawImageWithRadius(loadedImages[0], 0, 0, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[1], colW + gap, 0, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[2], 2 * colW + 2 * gap, 0, colW, rowH, borderRadius);
      drawImageWithRadius(loadedImages[3], 0, rowH + gap, width, rowH, borderRadius);
      drawImageWithRadius(loadedImages[4], 0, 2 * rowH + 2 * gap, width, rowH, borderRadius);
      break;
    }
    // For brevity and speed, I'll implement a generic grid fallback first
    default: {
      const cols = Math.ceil(Math.sqrt(imageCount));
      const rows = Math.ceil(imageCount / cols);
      const w = (width - (cols - 1) * gap) / cols;
      const h = (height - (rows - 1) * gap) / rows;
      
      loadedImages.forEach((img, idx) => {
        const x = (idx % cols) * (w + gap);
        const y = Math.floor(idx / cols) * (h + gap);
        drawImageWithRadius(img, x, y, w, h, borderRadius);
      });
      break;
    }
  }

  // Draw Text Overlay
  if (textOverlay) {
    ctx.save();
    const x = (textOverlay.position.x / 100) * width;
    const y = (textOverlay.position.y / 100) * height;
    
    // Scale font size based on render resolution
    const fontSize = textOverlay.fontSize * scale;
    
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = textOverlay.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4 * scale;
    ctx.shadowOffsetX = 2 * scale;
    ctx.shadowOffsetY = 2 * scale;
    
    ctx.fillText(textOverlay.text, x, y);
    ctx.restore();
  }

  // Export to Blob
  if (canvas instanceof OffscreenCanvas) {
    return await canvas.convertToBlob({ type: 'image/jpeg', quality });
  } else {
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    });
  }
}
