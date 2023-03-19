import { isString } from "../shared";
import { RootNode } from "./ast";
import { generate } from "./codegen";
import { baseParse } from "./parse";
import { DirectiveTransform, NodeTransform, transform } from "./transform";

import { transformElement } from "./transforms/transformElement";
import { transformOn } from "./transforms/vOn";
import { transformExpression } from "./transforms/transformExpression";
import { transformBind } from "./transforms/vBind";
import { transformFor } from "./transforms/vFor";

export type TransformPreset = [
  NodeTransform[],
  Record<string, DirectiveTransform>
];

export function getBaseTransformPreset(): TransformPreset {
  return [
    [transformFor, transformExpression, transformElement],
    {
      on: transformOn,
      bind: transformBind,
    },
  ];
}

export function baseCompile(
  template: string | RootNode,
  { __BROWSER__ }: { __BROWSER__: boolean }
) {
  // parse
  const ast = isString(template) ? baseParse(template) : template;

  // transform
  const [nodeTransforms, directiveTransforms] = getBaseTransformPreset();
  transform(ast, {
    nodeTransforms: [...nodeTransforms],
    directiveTransforms: { ...directiveTransforms },
  });

  // codegen
  const code = generate(ast, { __BROWSER__ });

  // FIXME: remove this
  import("fs").then((fs) => {
    fs.writeFileSync("./out.json", JSON.stringify(ast, null, 2));
  });

  return code;
}
