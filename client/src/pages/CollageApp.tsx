import { useState, useEffect, useMemo } from "react";
import { ImageIcon } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ImageUploader from "@/components/ImageUploader";
import CollageSettings from "@/components/CollageSettings";
import CombinationCalculator, {
  calculatePermutations,
} from "@/components/CombinationCalculator";
import LayoutSelector from "@/components/LayoutSelector";
import TextOverlayControls from "@/components/TextOverlayControls";
import CollagePreview from "@/components/CollagePreview";
import DownloadSection from "@/components/DownloadSection";
import type { TextOverlay } from "@shared/schema";
import { collageLayouts } from "@shared/schema";
import JSZip from "jszip";
import html2canvas from "html2canvas";

interface UploadedImage {
  id: string;
  url: string;
  label: string;
  file: File;
}

interface Combination {
  name: string;
  images: UploadedImage[];
}

export default function CollageApp() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imagesPerCollage, setImagesPerCollage] = useState(3);
  const [selectedLayout, setSelectedLayout] = useState("grid-2x2");
  const [textOverlay, setTextOverlay] = useState<TextOverlay | null>(null);
  const [currentCombinationIndex, setCurrentCombinationIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [borderRadius, setBorderRadius] = useState(4);
  const [gap, setGap] = useState(8);

  const handleImagesAdd = (files: File[]) => {
    const newImages: UploadedImage[] = files.map((file, index) => {
      const parts = file.name.split('.');
      const originalName = parts.length > 1 ? parts.slice(0, -1).join('.') : file.name;
      return {
        id: Date.now() + index + "",
        url: URL.createObjectURL(file),
        label: originalName,
        file,
      };
    });
    setImages([...images, ...newImages]);
  };

  const handleImageRemove = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    setImages(updatedImages);
  };

  // Calculate all combinations
  const combinations = useMemo(() => {
    if (images.length < imagesPerCollage) return [];

    const getPermutations = (
      arr: UploadedImage[],
      k: number
    ): UploadedImage[][] => {
      if (k === 0) return [[]];
      if (arr.length === 0) return [];

      let result: UploadedImage[][] = [];
      for (let i = 0; i < arr.length; i++) {
        const current = arr[i];
        const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
        const perms = getPermutations(remaining, k - 1);
        for (const p of perms) {
          result.push([current, ...p]);
        }
      }

      return result;
    };

    const combos = getPermutations(images, imagesPerCollage);
    return combos.map((combo) => ({
      name: combo.map((img) => img.label).join("+"),
      images: combo,
    }));
  }, [images, imagesPerCollage]);

  // Update layout when images per collage changes
  useEffect(() => {
    const layouts =
      collageLayouts[imagesPerCollage as keyof typeof collageLayouts] || [];
    if (layouts.length > 0) {
      const layoutsArray = layouts as readonly string[];
      if (!layoutsArray.includes(selectedLayout)) {
        setSelectedLayout(layouts[0] as string);
      }
    }
  }, [imagesPerCollage, selectedLayout]);

  // Reset combination index when combinations change
  useEffect(() => {
    setCurrentCombinationIndex(0);
  }, [combinations.length]);

  const totalCombinations = calculatePermutations(
    images.length,
    imagesPerCollage
  );

  const currentCombination = combinations[currentCombinationIndex];

  const handleDownloadAll = async () => {
    setIsGenerating(true);
    
    try {
      const zip = new JSZip();
      const previewElement = document.querySelector('.collage-preview-container') as HTMLElement;
      
      if (!previewElement) {
        throw new Error("Preview element not found");
      }

      // Store original state
      const originalIndex = currentCombinationIndex;

      for (let i = 0; i < combinations.length; i++) {
        // Update current combination to render it
        setCurrentCombinationIndex(i);
        
        // Wait for React to render
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const canvas = await html2canvas(previewElement, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          scale: 2, // Reduced from 4 to 2 for better balance of quality and file size
          logging: false
        });
        
        const blob = await new Promise<Blob | null>(resolve => 
          canvas.toBlob(resolve, 'image/jpeg', 0.8) // Changed from PNG to JPEG with 80% quality
        );
        
        if (blob) {
          zip.file(`${combinations[i].name}.jpg`, blob);
        }
      }

      // Restore original state
      setCurrentCombinationIndex(originalIndex);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `collages_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating ZIP:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <ImageIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Collage Maker</h1>
              <p className="text-xs text-muted-foreground">
                Smart combination generator
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-[280px_1fr_320px] gap-6">
            {/* Left Panel - Upload */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Upload Photos</h2>
                <ImageUploader
                  images={images}
                  onImagesAdd={handleImagesAdd}
                  onImageRemove={handleImageRemove}
                />
              </div>
            </div>

            {/* Center Panel - Preview */}
            <div className="space-y-6 flex flex-col">
              <div>
                <h2 className="text-lg font-semibold mb-3">Live Preview</h2>
                {currentCombination ? (
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-[800px]">
                      <CollagePreview
                        images={currentCombination.images}
                        layout={selectedLayout}
                        textOverlay={textOverlay}
                        collageName={currentCombination.name}
                        currentIndex={currentCombinationIndex + 1}
                        totalCount={combinations.length}
                        onTextOverlayChange={setTextOverlay}
                        borderRadius={borderRadius}
                        gap={gap}
                        onPrevious={
                          currentCombinationIndex > 0
                            ? () =>
                                setCurrentCombinationIndex(
                                  currentCombinationIndex - 1
                                )
                            : undefined
                        }
                        onNext={
                          currentCombinationIndex < combinations.length - 1
                            ? () =>
                                setCurrentCombinationIndex(
                                  currentCombinationIndex + 1
                                )
                            : undefined
                        }
                      />
                    </div>
                  </div>
                ) : (
                <div className="aspect-square bg-muted/30 rounded-lg border-2 border-dashed flex items-center justify-center">
                  <div className="text-center p-8">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Upload at least {imagesPerCollage} images to see preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="space-y-4">
            <CollageSettings
              imagesPerCollage={imagesPerCollage}
              onImagesPerCollageChange={setImagesPerCollage}
              totalImages={images.length}
              borderRadius={borderRadius}
              onBorderRadiusChange={setBorderRadius}
              gap={gap}
              onGapChange={setGap}
            />

            {images.length >= 2 && (
              <CombinationCalculator n={images.length} r={imagesPerCollage} />
            )}

            {images.length >= imagesPerCollage && (
              <>
                <LayoutSelector
                  imagesPerCollage={imagesPerCollage}
                  selectedLayout={selectedLayout}
                  onLayoutSelect={setSelectedLayout}
                />

                <TextOverlayControls
                  textOverlay={textOverlay}
                  onTextOverlayChange={setTextOverlay}
                />

                <DownloadSection
                  collageCount={combinations.length}
                  onDownload={handleDownloadAll}
                  isGenerating={isGenerating}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
