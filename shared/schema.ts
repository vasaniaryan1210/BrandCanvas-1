import { z } from "zod";

// Collage template layouts
export const collageLayouts = {
  2: ['side-by-side', 'stacked', 'diagonal', 'overlap', 'polaroid'],
  3: ['triangle', 'L-shape', 'horizontal', 'vertical', 'grid'],
  4: ['grid-2x2', 'asymmetric', 'magazine', 'creative', 'polaroid-grid', 'rounded-organic', 'circle-center'],
  5: ['cross', 'circle', 'asymmetric', 'magazine', 'grid'],
  6: ['grid-2x3', 'grid-3x2', 'hexagon', 'magazine', 'creative'],
  7: ['honeycomb', 'asymmetric', 'creative', 'magazine', 'grid'],
  8: ['grid-2x4', 'grid-4x2', 'octagon', 'magazine', 'creative'],
  9: ['grid-3x3', 'asymmetric', 'magazine', 'creative', 'mosaic'],
} as const;

export const uploadedImageSchema = z.object({
  id: z.string(),
  file: z.instanceof(File),
  url: z.string(),
  label: z.string(), // alphabetic label (a, b, c, etc.)
});

export const textOverlaySchema = z.object({
  text: z.string(),
  fontSize: z.number().min(12).max(72),
  color: z.string(),
  position: z.object({
    x: z.number().min(0).max(100), // percentage from left
    y: z.number().min(0).max(100), // percentage from top
  }),
});

export const collageSettingsSchema = z.object({
  imagesPerCollage: z.number().min(2).max(9),
  selectedLayout: z.string(),
  textOverlay: textOverlaySchema.nullable(),
  borderRadius: z.number().min(0).max(50).default(4),
  gap: z.number().min(0).max(40).default(8),
});

export const generatedCollageSchema = z.object({
  id: z.string(),
  name: z.string(), // e.g., "a+b+c+d"
  imageIds: z.array(z.string()),
  layout: z.string(),
  textOverlay: textOverlaySchema.nullable(),
  canvasDataUrl: z.string().nullable(),
});

export type UploadedImage = z.infer<typeof uploadedImageSchema>;
export type TextOverlay = z.infer<typeof textOverlaySchema>;
export type CollageSettings = z.infer<typeof collageSettingsSchema>;
export type GeneratedCollage = z.infer<typeof generatedCollageSchema>;
