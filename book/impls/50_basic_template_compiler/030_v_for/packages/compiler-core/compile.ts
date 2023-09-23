import { generate } from "./codegen";
import { CompilerOptions } from "./options";
import { baseParse } from "./parse";
import { DirectiveTransform, NodeTransform, transform } from "./transform";
import { transformElement } from "./transforms/transformElement";
import { transformBind } from "./transforms/vBind";
import { transformFor } from "./transforms/vFor";
import { transformOn } from "./transforms/vOn";

export type TransformPreset = [
  NodeTransform[],
  Record<string, DirectiveTransform>
];

export function getBaseTransformPreset(): TransformPreset {
  return [
    [transformFor, transformElement],
    { bind: transformBind, on: transformOn },
  ];
}

export function baseCompile(template: string, option: CompilerOptions) {
  const ast = baseParse(template.trim());

  const [nodeTransforms, directiveTransforms] = getBaseTransformPreset();

  transform(ast, {
    ...option,
    nodeTransforms: [...nodeTransforms],
    directiveTransforms: {
      ...directiveTransforms,
      ...option.directiveTransforms,
    },
  });

  const code = generate(ast, option);
  console.log("🚀 ~ file: compile.ts:37 ~ baseCompile ~ code:", code);

  return code;
}
