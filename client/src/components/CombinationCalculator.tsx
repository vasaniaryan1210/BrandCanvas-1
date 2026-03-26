import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface CombinationCalculatorProps {
  n: number; // total images
  r: number; // images per collage
}

// Calculate permutations P(n, r) = n! / (n - r)!
export function calculatePermutations(n: number, r: number): number {
  if (n <= 0 || r < 0) return 0;
  if (r > n) return 0;
  if (r === 0) return 1;

  let result = 1;
  for (let i = 0; i < r; i++) {
    result *= (n - i);
  }
  return result;
}

export default function CombinationCalculator({
  n,
  r,
}: CombinationCalculatorProps) {
  const totalPermutations = calculatePermutations(n, r);

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className="text-3xl font-bold text-primary"
                data-testid="text-total-combinations"
              >
                {totalPermutations}
              </span>
              <span className="text-sm text-muted-foreground">
                collages will be generated
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}