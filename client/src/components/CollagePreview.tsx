import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TextOverlay } from "@shared/schema";

interface CollagePreviewProps {
  images: { url: string; label: string }[];
  layout: string;
  textOverlay: TextOverlay | null;
  collageName: string;
  currentIndex?: number;
  totalCount?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onTextOverlayChange?: (overlay: TextOverlay | null) => void;
  borderRadius?: number;
  gap?: number;
}

export default function CollagePreview({
  images,
  layout,
  textOverlay,
  collageName,
  currentIndex = 1,
  totalCount = 1,
  onPrevious,
  onNext,
  onTextOverlayChange,
  borderRadius = 4,
  gap = 8,
}: CollagePreviewProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
  }, [images, layout, textOverlay]);

  // Set up window-level event listeners for drag handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !textOverlay || !onTextOverlayChange || !canvasRef.current) return;
      
      // Check if mouse button is still pressed
      if (e.buttons !== 1) {
        setIsDragging(false);
        return;
      }
      
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaYPercent = (deltaY / rect.height) * 100;
      
      const newX = Math.max(0, Math.min(100, textOverlay.position.x + deltaXPercent));
      const newY = Math.max(0, Math.min(100, textOverlay.position.y + deltaYPercent));
      
      onTextOverlayChange({
        ...textOverlay,
        position: { x: newX, y: newY }
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, textOverlay, onTextOverlayChange, dragStart]);

  const handleTextMouseDown = (e: React.MouseEvent) => {
    if (!textOverlay || !onTextOverlayChange || !canvasRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const borderRadiusStyle = { borderRadius: `${borderRadius}px` };
  const gapValue = gap;
  // For grid layouts - only gap, no padding around edges
  const gridGapStyle = { 
    gap: `${gapValue}px`
  } as React.CSSProperties;
  
  const gapStyle = gridGapStyle;
  
  // For absolute positioned layouts - may need padding
  const absoluteGapStyle = {
    "--collage-gap": `${gapValue}px`
  } as React.CSSProperties;

  const renderLayout = () => {
    const imageCount = images.length;

    // Layout rendering based on name and image count
    switch (layout) {
      // 2 images
      case "side-by-side":
        return (
          <div className="grid grid-cols-2 h-full w-full" style={gridGapStyle}>
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-muted overflow-hidden" style={borderRadiusStyle}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );

      case "stacked":
        return (
          <div className="grid grid-rows-2 h-full w-full" style={gridGapStyle}>
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-muted overflow-hidden" style={borderRadiusStyle}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );

      case "diagonal":
        return (
          <div className="relative h-full w-full">
            <div 
              className="absolute overflow-hidden" 
              style={{ 
                ...borderRadiusStyle,
                top: "0px",
                left: "0px",
                right: `calc(50% + ${gapValue / 2}px)`,
                bottom: `calc(50% + ${gapValue / 2}px)`
              }}
            >
              <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
            </div>
            <div 
              className="absolute overflow-hidden" 
              style={{ 
                ...borderRadiusStyle,
                bottom: "0px",
                right: "0px",
                left: `calc(50% + ${gapValue / 2}px)`,
                top: `calc(50% + ${gapValue / 2}px)`
              }}
            >
              <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
            </div>
          </div>
        );

      case "overlap":
        return (
          <div className="relative h-full w-full">
            <div 
              className="absolute overflow-hidden shadow-lg z-10" 
              style={{ 
                ...borderRadiusStyle,
                top: "0px",
                left: "0px",
                right: "20%",
                bottom: "20%"
              }}
            >
              <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
            </div>
            <div 
              className="absolute overflow-hidden shadow-lg" 
              style={{ 
                ...borderRadiusStyle,
                top: "20%",
                right: "0px",
                left: "20%",
                bottom: "0px"
              }}
            >
              <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
            </div>
          </div>
        );

      case "polaroid":
      case "polaroid-grid":
        return (
          <div className={`grid ${imageCount <= 2 ? 'grid-cols-2' : imageCount <= 4 ? 'grid-cols-2 grid-rows-2' : imageCount <= 6 ? 'grid-cols-3 grid-rows-2' : 'grid-cols-3 grid-rows-3'} h-full w-full overflow-hidden`} style={gridGapStyle}>
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-white p-2 pb-8 rounded-sm shadow-lg flex flex-col border border-gray-100 min-h-0 overflow-hidden aspect-[3/4] mx-auto w-full max-h-full">
                <div className="flex-1 min-h-0 overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        );

      // 3 images
      case "triangle":
        return (
          <div className="relative h-full w-full">
            <div 
              className="absolute overflow-hidden" 
              style={{ 
                ...borderRadiusStyle,
                top: `${gapValue}px`,
                left: "25%",
                right: "25%",
                height: `calc(50% - ${gapValue / 2}px)`
              }}
            >
              <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
            </div>
            <div 
              className="absolute overflow-hidden" 
              style={{ 
                ...borderRadiusStyle,
                bottom: `${gapValue}px`,
                left: `${gapValue}px`,
                width: `calc(50% - ${gapValue / 2}px)`,
                height: `calc(50% - ${gapValue / 2}px)`
              }}
            >
              <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
            </div>
            <div 
              className="absolute overflow-hidden" 
              style={{ 
                ...borderRadiusStyle,
                bottom: `${gapValue}px`,
                right: `${gapValue}px`,
                width: `calc(50% - ${gapValue / 2}px)`,
                height: `calc(50% - ${gapValue / 2}px)`
              }}
            >
              <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
            </div>
          </div>
        );

      case "L-shape":
        return (
          <div className="grid grid-cols-2 grid-rows-2 h-full w-full" style={gridGapStyle}>
            <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
            </div>
          </div>
        );

      case "horizontal":
        return (
          <div className="grid grid-cols-3 h-full w-full" style={gridGapStyle}>
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-muted overflow-hidden" style={borderRadiusStyle}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );

      case "vertical":
        return (
          <div className="grid grid-rows-3 h-full w-full" style={gridGapStyle}>
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-muted overflow-hidden" style={borderRadiusStyle}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );

      // 4 images
      case "grid-2x2":
        return (
          <div className="grid grid-cols-2 grid-rows-2 h-full w-full" style={gridGapStyle}>
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-muted overflow-hidden" style={borderRadiusStyle}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );

      case "asymmetric":
        if (imageCount === 4) {
          return (
            <div className="grid grid-cols-3 grid-rows-3 h-full w-full" style={gridGapStyle}>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        } else if (imageCount === 5) {
          return (
            <div className="grid grid-cols-3 grid-rows-3 h-full w-full" style={gridGapStyle}>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        } else if (imageCount === 7) {
          return (
            <div className="grid grid-cols-4 grid-rows-4 h-full w-full" style={gridGapStyle}>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-3 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[6]?.url} alt={images[6]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        } else if (imageCount === 9) {
          return (
            <div className="grid grid-cols-3 grid-rows-4 h-full w-full" style={gridGapStyle}>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="row-span-3 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[6]?.url} alt={images[6]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[7]?.url} alt={images[7]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[8]?.url} alt={images[8]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        }
        return null;

      case "magazine":
        if (imageCount === 4) {
          return (
            <div className="grid grid-cols-2 grid-rows-3 h-full w-full" style={gridGapStyle}>
              <div className="row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        } else if (imageCount === 5) {
          return (
            <div className="grid grid-cols-3 grid-rows-3 h-full w-full" style={gridGapStyle}>
              <div className="row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        } else if (imageCount === 6) {
          return (
            <div className="grid grid-cols-3 grid-rows-4 h-full w-full" style={gridGapStyle}>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-3 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        } else if (imageCount === 7) {
          return (
            <div className="grid grid-cols-4 grid-rows-3 h-full w-full" style={gridGapStyle}>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[6]?.url} alt={images[6]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        } else if (imageCount === 8) {
          return (
            <div className="grid grid-cols-4 grid-rows-4 h-full w-full" style={gridGapStyle}>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[6]?.url} alt={images[6]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[7]?.url} alt={images[7]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        } else if (imageCount === 9) {
          return (
            <div className="grid grid-cols-4 grid-rows-4 h-full w-full" style={gridGapStyle}>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="row-span-3 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="row-span-3 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[6]?.url} alt={images[6]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[7]?.url} alt={images[7]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[8]?.url} alt={images[8]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        }
        return null;

      case "creative":
        if (imageCount === 4) {
          return (
            <div className="grid grid-cols-3 grid-rows-3 gap-[var(--collage-gap)] h-full w-full ">
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="row-span-3 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        } else if (imageCount === 6) {
          return (
            <div className="grid grid-cols-4 grid-rows-3 gap-[var(--collage-gap)] h-full w-full ">
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        } else if (imageCount === 7) {
          return (
            <div className="grid grid-cols-4 grid-rows-4 gap-[var(--collage-gap)] h-full w-full ">
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[6]?.url} alt={images[6]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        } else if (imageCount === 8) {
          return (
            <div className="grid grid-cols-4 grid-rows-3 gap-[var(--collage-gap)] h-full w-full ">
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-3 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[6]?.url} alt={images[6]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[7]?.url} alt={images[7]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        } else if (imageCount === 9) {
          return (
            <div className="grid grid-cols-4 grid-rows-3 gap-[var(--collage-gap)] h-full w-full ">
              <div className="col-span-2 row-span-3 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
                <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[6]?.url} alt={images[6]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[7]?.url} alt={images[7]?.label} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={borderRadiusStyle}>
                <img src={images[8]?.url} alt={images[8]?.label} className="w-full h-full object-cover" />
              </div>
            </div>
          );
        }
        return null;


      case "rounded-organic":
        return (
          <div className="relative h-full w-full ">
            <div className="absolute to left-3 w-[52%] h-[52%] rounded-full overflow-hidden shadow-lg">
              <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="absolute to right-3 w-[42%] h-[42%] overflow-hidden shadow-lg" style={borderRadiusStyle}>
              <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-3 left-3 w-[42%] h-[42%] rounded-full overflow-hidden shadow-lg">
              <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-3 right-3 w-[32%] h-[32%] rounded-full overflow-hidden shadow-lg">
              <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
            </div>
          </div>
        );

      case "circle-center":
        return (
          <div className="relative h-full w-full ">
            <div className="absolute to left-2 w-[48%] h-[48%] overflow-hidden" style={borderRadiusStyle}>
              <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="absolute to right-2 w-[48%] h-[48%] overflow-hidden" style={borderRadiusStyle}>
              <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-2 left-2 w-[48%] h-[48%] overflow-hidden" style={borderRadiusStyle}>
              <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[48%] h-[48%] rounded-full overflow-hidden shadow-2xl z-10 border-4 border-white">
              <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
            </div>
          </div>
        );

      // 5+ images - grids and special layouts
      case "grid-2x3":
        return (
          <div className="grid grid-cols-2 grid-rows-3 gap-[var(--collage-gap)] h-full w-full ">
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-muted overflow-hidden" style={borderRadiusStyle}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );

      case "grid-3x2":
        return (
          <div className="grid grid-cols-3 grid-rows-2 gap-[var(--collage-gap)] h-full w-full ">
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-muted overflow-hidden" style={borderRadiusStyle}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );

      case "grid-3x3":
        return (
          <div className="grid grid-cols-3 grid-rows-3 gap-[var(--collage-gap)] h-full w-full ">
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-muted overflow-hidden" style={borderRadiusStyle}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );

      case "grid-2x4":
        return (
          <div className="grid grid-cols-2 grid-rows-4 gap-[var(--collage-gap)] h-full w-full ">
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-muted overflow-hidden" style={borderRadiusStyle}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );

      case "grid-4x2":
        return (
          <div className="grid grid-cols-4 grid-rows-2 gap-[var(--collage-gap)] h-full w-full ">
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-muted overflow-hidden" style={borderRadiusStyle}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );

      case "cross":
        // 5 images in cross pattern - fills all space
        return (
          <div className="grid grid-cols-3 grid-rows-3 gap-[var(--collage-gap)] h-full w-full ">
            <div className="col-span-3 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="col-span-3 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
            </div>
          </div>
        );

      case "circle":
        // 5 images - no blank spaces
        return (
          <div className="grid grid-cols-3 grid-rows-3 gap-[var(--collage-gap)] h-full w-full ">
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="col-span-3 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="col-span-3 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
            </div>
          </div>
        );

      case "hexagon":
        return (
          <div className="relative h-full w-full overflow-hidden" style={{ ...gridGapStyle, gap: `${gapValue}px` }}>
            <div className="grid grid-cols-2 grid-rows-3 h-full w-full" style={{ ...gridGapStyle, gap: `${gapValue}px` }}>
              {images.map((img, idx) => (
                <div key={idx} className="relative bg-muted overflow-hidden" style={borderRadiusStyle}>
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        );

      case "honeycomb":
        // 7 images attractive honeycomb pattern
        return (
          <div className="grid grid-cols-4 grid-rows-4 gap-[var(--collage-gap)] h-full w-full ">
            <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[6]?.url} alt={images[6]?.label} className="w-full h-full object-cover" />
            </div>
          </div>
        );

      case "octagon":
        // 8 images unique octagon-inspired pattern
        return (
          <div className="grid grid-cols-4 grid-rows-4 h-full w-full " style={gridGapStyle}>
            <div className="col-start-2 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="col-start-3 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="row-start-2 col-start-1 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="row-start-2 col-start-4 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="row-start-3 col-start-1 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="row-start-3 col-start-4 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="row-start-4 col-start-2 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[6]?.url} alt={images[6]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="row-start-4 col-start-3 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[7]?.url} alt={images[7]?.label} className="w-full h-full object-cover" />
            </div>
          </div>
        );

      case "mosaic":
        // 9 images mosaic - varied sizes
        return (
          <div className="grid grid-cols-4 grid-rows-4 h-full w-full" style={gridGapStyle}>
            <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[0]?.url} alt={images[0]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="row-span-2 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[1]?.url} alt={images[1]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="row-span-2 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[2]?.url} alt={images[2]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[3]?.url} alt={images[3]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[4]?.url} alt={images[4]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="col-span-2 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[5]?.url} alt={images[5]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[6]?.url} alt={images[6]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden" style={borderRadiusStyle}>
              <img src={images[7]?.url} alt={images[7]?.label} className="w-full h-full object-cover" />
            </div>
            <div className="col-span-2 row-span-2 overflow-hidden" style={borderRadiusStyle}>
              <img src={images[8]?.url} alt={images[8]?.label} className="w-full h-full object-cover" />
            </div>
          </div>
        );

      // Default grid layout
      default:
        const cols = Math.ceil(Math.sqrt(imageCount));
        const rows = Math.ceil(imageCount / cols);
        return (
          <div className={`grid h-full w-full`} style={{ 
            ...gapStyle,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }}>
            {images.map((img, idx) => (
              <div key={idx} className="relative bg-muted overflow-hidden" style={borderRadiusStyle}>
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="relative w-full max-w-[1080px] mx-auto">
      <Card className="overflow-hidden shadow-2xl bg-card border-none">
        <div 
          ref={canvasRef}
          className="collage-preview-container relative w-full aspect-square bg-muted/20"
          data-testid="collage-container"
        >
          {renderLayout()}
          
          {textOverlay && (
            <div
              className="absolute"
              style={{
                left: `${textOverlay.position.x}%`,
                top: `${textOverlay.position.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: onTextOverlayChange ? 'move' : 'default',
              }}
              onMouseDown={handleTextMouseDown}
              data-testid="text-overlay-preview"
            >
              <div
                style={{
                  fontSize: `${textOverlay.fontSize}px`,
                  color: textOverlay.color,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  userSelect: 'none',
                }}
                className="font-bold whitespace-nowrap"
              >
                {textOverlay.text}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[var(--collage-gap)]">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevious}
            disabled={!onPrevious || currentIndex <= 1}
            data-testid="button-prev-collage"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-mono" data-testid="text-collage-name">
            {collageName}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            disabled={!onNext || currentIndex >= totalCount}
            data-testid="button-next-collage"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-[var(--collage-gap)]">
          <span className="text-sm text-muted-foreground">
            {currentIndex} of {totalCount}
          </span>
        </div>
      </div>
    </div>
  );
}
