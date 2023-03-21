import {
  NodeTypes,
  SimpleExpressionNode,
  createSimpleExpression,
} from "../ast";
import { NodeTransform, TransformContext } from "../transform";
import { isSimpleIdentifier } from "../utils";

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

export function processExpression(
  node: SimpleExpressionNode,
  context: TransformContext
): SimpleExpressionNode {
  // TODO: walk tree and process expressions
  // fast path if expression is a simple identifier.
  // const rawExp = node.content;
  // if (isSimpleIdentifier(rawExp)) {
  //   const isScopeVarReference = context.identifiers[rawExp];
  //   if (!isScopeVarReference) {
  //     return node;
  //   }
  // }

  return createSimpleExpression(`_ctx.${node.content}`);
}
