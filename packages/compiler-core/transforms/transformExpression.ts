import { parse } from "@babel/parser";
import { Identifier, Node } from "@babel/types";

import { isSimpleIdentifier } from "../utils";
import { walkIdentifiers } from "../babelUtils";
import { ExpressionNode, NodeTypes, SimpleExpressionNode } from "../ast";
import { NodeTransform, TransformContext } from "../transform";

export const transformExpression: NodeTransform = (node, context) => {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(
      node.content as SimpleExpressionNode,
      context
    );
  } else if (node.type === NodeTypes.ELEMENT) {
    for (let i = 0; i < node.props.length; i++) {
      const dir = node.props[i];
      if (dir.type === NodeTypes.DIRECTIVE && dir.name !== "for") {
        if (dir.type === NodeTypes.DIRECTIVE) {
          const exp = dir.exp;
          const arg = dir.arg;

          if (exp && exp.type === NodeTypes.SIMPLE_EXPRESSION) {
            dir.exp = processExpression(exp, context);
          }

          if (
            arg &&
            arg.type === NodeTypes.SIMPLE_EXPRESSION &&
            !arg.isStatic
          ) {
            dir.arg = processExpression(arg, context);
          }
        }
      }
    }
  }
};

interface PrefixMeta {
  start: number;
  end: number;
}

export function processExpression(
  node: SimpleExpressionNode,
  context: TransformContext
): ExpressionNode {
  const rawExp = node.content;
  const rewriteIdentifier = (raw: string) => {
    return `_ctx.${raw}`;
  };

  if (isSimpleIdentifier(rawExp)) {
    const isScopeVarReference = context.identifiers[rawExp];
    if (!isScopeVarReference) {
      node.content = rewriteIdentifier(rawExp);
      return node;
    }
  }

  // find ids
  const ast = parse(rawExp).program;
  type QualifiedId = Identifier & PrefixMeta;
  const ids: QualifiedId[] = [];
  const parentStack: Node[] = [];
  const knownIds: Record<string, number> = Object.create(context.identifiers);
  walkIdentifiers(
    ast,
    (node, _, __, isReferenced, isLocal) => {
      if (isReferenced && !isLocal) node.name = rewriteIdentifier(node.name);
      ids.push(node as QualifiedId);
    },
    parentStack,
    knownIds
  );

  return node;
}
