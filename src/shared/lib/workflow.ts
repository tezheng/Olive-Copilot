type Workflow = {
  name: string;
  description: string;
  passes: Pass[];
  models: Model[];
  data: Data[];
};

type Pass = {
  id: string;
  label: string;
  description: string;
  type: string;
  config: Record<string, unknown>;
  model?: string;
  data?: string;
  metrics?: Record<string, unknown>;
  time: {
    start: number;
    end: number;
  };
  runId?: string;
  parentId?: string;
};

type Model = {
  id: string;
  type: string;
  description: string;
  config: Record<string, unknown>;
  attributes: Record<string, unknown>;
};

type Data = {
  id: string;
  type: string;
  description: string;
  script: {
    file: string;
    dir: string;
  };
  dataset: {
    type: string;
    params: Record<string, unknown>;
  };
  loader: {
    type: string;
    params: Record<string, unknown>;
  };
};

function parseWorkflow(workflow: Record<string, object>): Workflow {
  const modelIds = Object.keys(workflow);
  const passResults = Object.values(workflow).filter(
    (p: { from_pass?: Record<string, unknown> }) => p.from_pass
  );

  const passes = passResults.map(
    ({
      model_id: id,
      parent_model_id: parentId,
      from_pass: type,
      pass_run_config: config,
      description,
      metrics,
      start_time,
      end_time,
      ...rest
    }: any): Pass => {
      const data = config.data_config?.name;

      return {
        id,
        parentId,
        type,
        label: type ?? id,
        description: description ?? type,
        config,
        model: id,
        data,
        metrics,
        time: {
          start: start_time,
          end: end_time,
        },
        ...rest,
      };
    }
  );

  const models = passResults
    .map((p: any) => ({
      id: p.model_id,
      ...p.model_config,
    }))
    .filter((model) => model != null)
    .map(({ id, type, description, config }: any): Model => {
      const { model_attributes: attributes, ...rest } = config;
      return {
        id,
        type,
        description: description ?? type,
        attributes,
        config: rest,
      };
    });

  const data = passResults
    .map((pass: any): Pass => pass.pass_run_config.data_config)
    .filter((data) => data != null)
    .map(
      ({
        name: id,
        type,
        description,
        user_script: file,
        script_dir: dir,
        load_dataset_config: dataset,
        dataloader_config: loader,
      }: any): Data => {
        return {
          id,
          type,
          description: description ?? type,
          script: { file, dir },
          dataset,
          loader,
        };
      }
    );

  return {
    name: "workflow",
    description: "workflow",
    passes,
    models,
    data,
  };
}

export { parseWorkflow };

export type { Workflow, Pass, Model, Data };
