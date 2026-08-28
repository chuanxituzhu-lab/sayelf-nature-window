export const OUTPUT_TYPES = Object.freeze(["image", "storyboard", "both"]);
export const OUTPUT_CONTRACT = "hidden-nature-window.output";
export const OUTPUT_VERSION = "0.5.0";
export const VISUAL_GRAMMAR = Object.freeze(["enter", "enclose", "guide", "reveal"]);

export function normalizeOutput(value = "image") {
  if (!OUTPUT_TYPES.includes(value)) {
    const error = new Error(`Unsupported output: ${value}`);
    error.code = "UNSUPPORTED_OUTPUT";
    throw error;
  }
  return value;
}

export function selectedOutputTypes(output) {
  return normalizeOutput(output) === "both" ? ["image", "storyboard"] : [output];
}

export function createOutputContract({
  output,
  language,
  source = "preset",
  scene_id,
  scene,
  seed,
  variation,
  outputs,
  errors = []
}) {
  const contract = {
    contract: OUTPUT_CONTRACT,
    version: OUTPUT_VERSION,
    output: normalizeOutput(output),
    language,
    source,
    scene,
    seed,
    variation,
    visual_grammar: [...VISUAL_GRAMMAR],
    outputs,
    errors
  };
  if (scene_id) contract.scene_id = scene_id;
  return validateOutputContract(contract);
}

export function validateOutputContract(contract) {
  if (contract.contract !== OUTPUT_CONTRACT) throw new Error("Invalid output contract name");
  if (!OUTPUT_TYPES.includes(contract.output)) throw new Error("Invalid output contract selection");
  if (JSON.stringify(contract.visual_grammar) !== JSON.stringify(VISUAL_GRAMMAR)) {
    throw new Error("Output contract changed the frozen visual grammar");
  }
  const selected = new Set(selectedOutputTypes(contract.output));
  for (const type of Object.keys(contract.outputs || {})) {
    if (!selected.has(type)) throw new Error(`Unexpected output fragment: ${type}`);
  }
  if (!Array.isArray(contract.errors)) throw new Error("Output contract errors must be an array");
  return contract;
}

export function renderOutputContract(contract) {
  return Object.values(contract.outputs || {})
    .map(output => output.text || output.prompt || JSON.stringify(output, null, 2))
    .join("\n\n");
}
