import { cn } from "@/shared/lib/utils";

import { useState } from "react";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CardNode } from "@/components/workflow/card-node";
import { Tag } from "@/components/Tag";

import {
  Node,
  NodeProps,
  NodeToolbar,
  NodeToolbarProps,
  Handle,
  Position,
} from "@xyflow/react";

export type PassNodeType = Node<{
  label: string;
  subLabel?: string;
  description?: string;
  tags?: string[];
  config: Record<string, object>;
  elapsedTime: number;
  className?: string;
}>;

const ConfigProperty = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: string;
}): JSX.Element => {
  return (
    <div className="flex items-center justify-between gap-8">
      {icon && <img src={icon} alt={label} className="w-4 h-4" />}
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm max-w-32 truncate">{value}</p>
    </div>
  );
};

const PassNode = ({ data, selected }: NodeProps<PassNodeType>) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const handleFocus = () => setTooltipVisible(true);
  const handleBlur = () => setTooltipVisible(false);

  const { label, config, description, subLabel, tags } = data;

  return (
    <CardNode
      onMouseEnter={() => handleFocus()}
      onMouseLeave={() => handleBlur()}
      onFocus={handleFocus}
      onBlur={handleBlur}
      selected={selected}
      tabIndex={0}
    >
      <CardHeader>
        <div className="flex justify-between gap-8 items-baseline">
          <CardTitle>{label}</CardTitle>
          {subLabel && <p className="text-sm">{subLabel}</p>}
        </div>
        <CardDescription>{description ?? label}</CardDescription>
        <CardDescription className="flex gap-1">
          {tags && tags.map((tag) => <Tag label={tag} />)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {Object.entries(config)
            .filter(([, v]) => !(v instanceof Object) && v != null)
            .map(([key, value]) => (
              <ConfigProperty key={key} label={key} value={value.toString()} />
            ))}
        </div>
      </CardContent>
      <NodeToolbar
        isVisible={isTooltipVisible}
        className="rounded-sm bg-primary p-2 text-primary-foreground"
        // position={data.tooltip?.position}
        tabIndex={1}
      >
        {label}
      </NodeToolbar>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" id="reverseIn" position={Position.Right} />
      <Handle type="source" id="reverseOut" position={Position.Left} />
    </CardNode>
  );
};

export { PassNode };
