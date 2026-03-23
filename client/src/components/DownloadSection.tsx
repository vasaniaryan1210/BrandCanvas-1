import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileArchive } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DownloadSectionProps {
  collageCount: number;
  onDownload: () => void;
  isGenerating?: boolean;
}

export default function DownloadSection({
  collageCount,
  onDownload,
  isGenerating = false,
}: DownloadSectionProps) {
  return (
    <Card>
      <CardHeader className="gap-1 space-y-0 pb-3">
        <CardTitle className="text-lg">Download Collages</CardTitle>
        <p className="text-sm text-muted-foreground">
          All collages in one ZIP file
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-md">
          <FileArchive className="w-8 h-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium">Collages.zip</p>
            <p className="text-sm text-muted-foreground">
              {collageCount} {collageCount === 1 ? "collage" : "collages"}
            </p>
          </div>
          <Badge variant="secondary">{collageCount}</Badge>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={onDownload}
          disabled={collageCount === 0 || isGenerating}
          data-testid="button-download-zip"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? "Generating..." : "Download All as ZIP"}
        </Button>
      </CardContent>
    </Card>
  );
}
