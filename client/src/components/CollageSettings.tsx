import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface CollageSettingsProps {
  imagesPerCollage: number;
  onImagesPerCollageChange: (value: number) => void;
  totalImages: number;
  borderRadius: number;
  onBorderRadiusChange: (value: number) => void;
  gap: number;
  onGapChange: (value: number) => void;
}

export default function CollageSettings({
  imagesPerCollage,
  onImagesPerCollageChange,
  totalImages,
  borderRadius,
  onBorderRadiusChange,
  gap,
  onGapChange,
}: CollageSettingsProps) {
  const maxImagesPerCollage = Math.min(totalImages, 9);

  return (
    <Card>
      <CardHeader className="gap-1 space-y-0 pb-3">
        <CardTitle className="text-lg">Collage Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="images-per-collage">Images per Collage</Label>
            <div
              className="text-3xl font-bold text-primary"
              data-testid="text-images-per-collage"
            >
              {imagesPerCollage}
            </div>
          </div>
          <Slider
            id="images-per-collage"
            min={2}
            max={maxImagesPerCollage}
            step={1}
            value={[imagesPerCollage]}
            onValueChange={([value]) => onImagesPerCollageChange(value)}
            disabled={totalImages < 2}
            data-testid="slider-images-per-collage"
          />
          <p className="text-xs text-muted-foreground">
            {totalImages < 2
              ? "Upload at least 2 images to start"
              : `Choose 2-${maxImagesPerCollage} images per collage`}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="border-radius">Border Radius</Label>
            <div
              className="text-xl font-semibold text-primary"
              data-testid="text-border-radius"
            >
              {borderRadius}px
            </div>
          </div>
          <Slider
            id="border-radius"
            min={0}
            max={50}
            step={1}
            value={[borderRadius]}
            onValueChange={([value]) => onBorderRadiusChange(value)}
            data-testid="slider-border-radius"
          />
          <p className="text-xs text-muted-foreground">
            Adjust the roundness of image corners (0-50px)
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="gap-control">Spacing (Gap)</Label>
            <div
              className="text-xl font-semibold text-primary"
              data-testid="text-gap-value"
            >
              {gap}px
            </div>
          </div>
          <Slider
            id="gap-control"
            min={0}
            max={40}
            step={1}
            value={[gap]}
            onValueChange={([value]) => onGapChange(value)}
            data-testid="slider-gap-control"
          />
          <p className="text-xs text-muted-foreground">
            Adjust the distance between images (0-40px)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
