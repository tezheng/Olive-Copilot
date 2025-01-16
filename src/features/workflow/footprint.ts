import type { NodeBase, EdgeBase } from "@xyflow/system";

import { parseWorkflow } from "@/shared/lib/workflow";

const width = 400;
const gutter = 100;

function estimateNodeSize(config: Record<string, unknown>): [number, number] {
  const cfgItems = Object.entries(config).filter(
    ([, v]) => !(v instanceof Object) && v != null
  );
  // hardcode width for now
  return [width, cfgItems.length * 25 + 150];
}

function initNodesAndEdges(workflowData: Record<string, object>): {
  nodes: NodeBase[];
  edges: EdgeBase[];
} {
  const passId = (id: string) => id && `pass-${id}`;
  const modelId = (id: string) => id && `model-${id}`;
  const datasetId = (id: string) => id && `ds-${id}`;
  const loaderId = (id: string) => id && `loader-${id}`;

  const { passes, models, data } = parseWorkflow(workflowData);

  // Generate nodes
  const passNodes = passes.map(
    ({ id, label, config, description, time }): NodeBase => {
      const elapsedTime = (time.end - time.start).toFixed(2);

      return {
        id: passId(id),
        data: {
          name: id,
          class: "pass",
          label: label,
          subLabel: `${elapsedTime}s`,
          description,
          tags: [label.startsWith("QNPU") ? "NPU" : "CPU"],
          config,
          elapsedTime,
        },
        draggable: true,
        position: { x: 0, y: 0 },
      };
    }
  );

  const modelNodes = models.map(({ id, type, config, attributes }) => {
    const { model_path, label } = config;

    return {
      id: modelId(id),
      data: {
        name: id,
        class: "model",
        type,
        label: label ?? `${id}`,
        description: type,
        tags: ["ONNX"],
        path: model_path,
        config,
        attributes,
      },
      draggable: true,
      position: { x: 0, y: 0 },
    };
  });

  const dataNodePairs = data.map(({ id, type, script, dataset, loader }) => {
    const { file: script_file, dir: script_dir } = script;
    const datasetNode = dataset
      ? {
          id: datasetId(id),
          data: {
            name: id,
            class: "dataset",
            type: dataset.type,
            label: "Dataset",
            subLabel: type,
            description: dataset.type,
            tags: ["HuggingFace", "ImageNet"],
            config: {
              script_file,
              script_dir,
              ...dataset.params,
            },
          },
          draggable: true,
          position: { x: 0, y: 0 },
        }
      : null;
    const loaderNode = loader
      ? {
          id: loaderId(id),
          data: {
            name: id,
            class: "dataloader",
            type: loader.type,
            label: "DataLoader",
            subLabel: type,
            description: loader.type,
            tags: ["PyTorch"],
            config: {
              script_file,
              script_dir,
              ...loader.params,
            },
          },
          draggable: true,
          position: { x: 0, y: 0 },
        }
      : null;
    return [datasetNode, loaderNode];
  });
  const dataNodes = dataNodePairs.flat().filter((node) => node != null);

  // Generate edges
  const passEdges = passes
    .map((pass) =>
      pass.parentId
        ? {
            id: `${passId(pass.parentId)}-${passId(pass.id)}`,
            source: passId(pass.parentId),
            target: passId(pass.id),
          }
        : null
    )
    .filter((edge) => edge != null);

  const modelEdeges = passes.map((pass) => ({
    id: `${passId(pass.id)}-${modelId(pass.id)}`,
    source: passId(pass.id),
    target: modelId(pass.id),
  }));

  const dataEdges = dataNodePairs
    .map(([ds, loader]) => {
      if (!ds || !loader) {
        return null;
      }
      const id = ds.data.name;
      return {
        id: `datacontainer-${datasetId(id)}-${loaderId(id)}`,
        source: datasetId(id),
        target: loaderId(id),
      };
    })
    .filter((edge) => edge != null);

  const dataPassEdges = passes
    .map(({ id, data }) => {
      if (!data) {
        return null;
      }
      const loaderNode = dataNodes.find((node) => node.id === loaderId(data));
      if (!loaderNode) {
        return null;
      }

      return {
        id: `dataloader-${loaderId(data)}-${passId(id)}`,
        source: loaderId(data),
        sourceHandle: "reverseOut",
        target: passId(id),
        targetHandle: "reverseIn",
      };
    })
    .filter((edge) => edge != null);

  // Layout pass nodes
  passes.forEach(({ label, data, model, config }, i, arr) => {
    if (i > 0) {
      const parentIdx = i - 1;
      const [width, height] = estimateNodeSize(arr[parentIdx].config);
      passNodes[i].position = {
        x: passNodes[parentIdx].position.x + width * 0.5,
        y: passNodes[parentIdx].position.y + height + gutter,
      };
    }

    const [width, height] = estimateNodeSize(config);

    // Layout models that are generated each pass
    if (model) {
      const isLastPass = i === arr.length - 1;
      const modelNode = modelNodes.find(({ id }) => id === modelId(model));
      if (modelNode) {
        const { x, y } = passNodes[i].position;
        modelNode.position = {
          x: isLastPass ? x : x - width * 0.5,
          y: y + height + gutter,
        };

        // HACK! FIXME!
        if (label.includes("Quant")) {
          modelNode.data.tags.push(...["Quantized"]);
        } else if (label.startsWith("QNPU")) {
          modelNode.data.tags.push(...["Quantized", "EPContext"]);
        }
      }
    }

    // Layout data nodes
    if (data) {
      // Layout data loaders that are used by the pass
      const loaderNode = dataNodes.find(({ id }) => id === loaderId(data));
      if (loaderNode) {
        const { x, y } = passNodes[i].position;
        const [, loaderHeight] = estimateNodeSize(loaderNode.data.config);
        loaderNode.position = {
          x: x + width + gutter,
          y: y + (height - loaderHeight) * 0.5,
        };

        // Layout datasets that are used by the loader
        const dsNode = dataNodes.find(({ id }) => id === datasetId(data));
        if (dsNode) {
          const [, dsHeight] = estimateNodeSize(dsNode.data.config);
          dsNode.position = {
            x: loaderNode.position.x,
            y: loaderNode.position.y - dsHeight - gutter,
          };
        }
      }
    }
  });

  const nodes = [...passNodes, ...modelNodes, ...dataNodes];
  const edges = [...passEdges, ...modelEdeges, ...dataEdges, ...dataPassEdges];

  return { nodes, edges };
}

export { initNodesAndEdges };
