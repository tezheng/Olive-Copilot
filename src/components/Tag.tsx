import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";

type TagConfig = {
  label: string;
  icon?: string;
};

// FIXME
const tagColorMap: Record<string, string> = {
  NPU: "bg-rose-500",
  CPU: "bg-zinc-500",
  EPContext: "bg-green-500",
  PyTorch: "bg-indigo-500",
  Quantized: "bg-orange-500",
  ImageNet: "bg-purple-500",
  HuggingFace: "bg-yellow-500",
};

export interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    TagConfig {}

function Tag({ className, label, ...props }: TagProps): JSX.Element {
  return (
    <Badge key={label} className={cn(tagColorMap[label], className)} {...props}>
      {label}
    </Badge>
  );
}

export { Tag };
