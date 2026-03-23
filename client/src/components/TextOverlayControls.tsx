import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { TextOverlay } from "@shared/schema";

interface TextOverlayControlsProps {
  textOverlay: TextOverlay | null;
  onTextOverlayChange: (overlay: TextOverlay | null) => void;
}


const colorPresets = [
  "#FFFFFF", "#000000", "#EF4444", "#F59E0B", "#10B981", 
  "#3B82F6", "#8B5CF6", "#EC4899", "#6366F1"
];

export default function TextOverlayControls({
  textOverlay,
  onTextOverlayChange,
}: TextOverlayControlsProps) {
  const overlay = textOverlay || {
    text: "",
    fontSize: 24,
    color: "#FFFFFF",
    position: { x: 50, y: 50 },
  };

  const updateOverlay = (updates: Partial<TextOverlay>) => {
    const newOverlay = { ...overlay, ...updates } as TextOverlay;
    onTextOverlayChange(newOverlay.text ? newOverlay : null);
  };

  return (
    <Card>
      <CardHeader className="gap-1 space-y-0 pb-3">
        <CardTitle className="text-lg">Text Overlay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="overlay-text">Text</Label>
          <Input
            id="overlay-text"
            placeholder="Enter text to overlay..."
            value={overlay.text}
            onChange={(e) => updateOverlay({ text: e.target.value })}
            data-testid="input-overlay-text"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="font-size">Font Size</Label>
            <span className="text-sm text-muted-foreground">{overlay.fontSize}px</span>
          </div>
          <Slider
            id="font-size"
            min={12}
            max={72}
            step={1}
            value={[overlay.fontSize]}
            onValueChange={([value]) => updateOverlay({ fontSize: value })}
            data-testid="slider-font-size"
          />
        </div>

        <div className="space-y-2">
          <Label>Text Color</Label>
          <div className="flex gap-2 flex-wrap">
            {colorPresets.map((color) => (
              <button
                key={color}
                onClick={() => updateOverlay({ color })}
                className={`w-8 h-8 rounded-md border-2 transition-all hover-elevate active-elevate-2 ${
                  overlay.color === color
                    ? "border-primary scale-110"
                    : "border-border"
                }`}
                style={{ backgroundColor: color }}
                data-testid={`button-color-${color}`}
              />
            ))}
          </div>
          <Input
            type="color"
            value={overlay.color}
            onChange={(e) => updateOverlay({ color: e.target.value })}
            className="w-full h-10"
            data-testid="input-custom-color"
          />
        </div>

        <div className="space-y-2">
          <Label>Text Position (Drag text in preview)</Label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="position-x" className="text-xs">X Position (%)</Label>
              <Input
                id="position-x"
                type="number"
                min="0"
                max="100"
                value={Math.round(overlay.position.x)}
                onChange={(e) => updateOverlay({ 
                  position: { ...overlay.position, x: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="position-y" className="text-xs">Y Position (%)</Label>
              <Input
                id="position-y"
                type="number"
                min="0"
                max="100"
                value={Math.round(overlay.position.y)}
                onChange={(e) => updateOverlay({ 
                  position: { ...overlay.position, y: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
