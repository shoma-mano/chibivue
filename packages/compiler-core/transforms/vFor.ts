import {
  ExpressionNode,
  ForCodegenNode,
  ForNode,
  ForRenderListExpression,
  NodeTypes,
  SimpleExpressionNode,
  SourceLocation,
  createCallExpression,
  createSimpleExpression,
  createVNodeCall,
} from "../ast";
import { FRAGMENT, RENDER_LIST } from "../runtimeHelpers";
import {
  NodeTransform,
  createStructuralDirectiveTransform,
} from "../transform";
import { getInnerRange } from "../utils";

export const transformFor: NodeTransform = createStructuralDirectiveTransform(
  "for",
  (node, dir, context) => {
    const parseResult = parseForExpression(dir.exp as SimpleExpressionNode);

    // TODO: error handling when parseResult is undefined
    const { source, value, key } = parseResult!;

    const forNode: ForNode = {
      type: NodeTypes.FOR,
      loc: dir.loc,
      source,
      valueAlias: value,
      keyAlias: key,
      children: [node],
    };

    context.replaceNode(forNode);

    const renderExp = createCallExpression(context.helper(RENDER_LIST), [
      forNode.source,
    ]) as ForRenderListExpression;

    forNode.codegenNode = createVNodeCall(
      context,
      context.helper(FRAGMENT),
      undefined,
      renderExp
    ) as ForCodegenNode;
  }
);

const forAliasRE = /([\s\S]*?)\s+(?:in)\s+([\s\S]*)/;
export interface ForParseResult {
  source: ExpressionNode;
  value: ExpressionNode | undefined;
  key: ExpressionNode | undefined;
  index: ExpressionNode | undefined;
}

export function parseForExpression(
  input: SimpleExpressionNode
): ForParseResult | undefined {
  const loc = input.loc;
  const exp = input.content;
  const inMatch = exp.match(forAliasRE);
  if (!inMatch) return;

  const [, LHS, RHS] = inMatch;
  const result: ForParseResult = {
    source: createAliasExpression(
      loc,
      RHS.trim(),
      exp.indexOf(RHS, LHS.length)
    ),
    value: undefined,
    key: undefined,
    index: undefined,
  };

  return result;
}

function createAliasExpression(
  range: SourceLocation,
  content: string,
  offset: number
): SimpleExpressionNode {
  return createSimpleExpression(
    content,
    false,
    getInnerRange(range, offset, content.length)
  );
}
