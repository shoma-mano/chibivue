import { parse } from "@babel/parser";
import { Identifier, Node } from "@babel/types";

import { advancePositionWithClone, isSimpleIdentifier } from "../utils";
import { walkIdentifiers } from "../babelUtils";
import {
  CompoundExpressionNode,
  ExpressionNode,
  NodeTypes,
  SimpleExpressionNode,
  createCompoundExpression,
  createSimpleExpression,
} from "../ast";
import { NodeTransform, TransformContext } from "../transform";
// import { genPropsAccessExp, hasOwn } from "../../shared";
// import { BindingTypes } from "../options";
// import { UNREF } from "../runtimeHelpers";

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
        const exp = dir.exp;
        const arg = dir.arg;

        if (
          exp &&
          exp.type === NodeTypes.SIMPLE_EXPRESSION &&
          !(dir.name === "on" && arg)
        ) {
          dir.exp = processExpression(exp, context);
        }

        if (arg && arg.type === NodeTypes.SIMPLE_EXPRESSION && !arg.isStatic) {
          dir.arg = processExpression(arg, context);
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
  context: TransformContext,
  localVars: Record<string, number> = Object.create(context.identifiers)
): ExpressionNode {
  const rawExp = node.content;
  // const { inline, bindingMetadata } = context;

  const rewriteIdentifier = (raw: string, parent?: Node, id?: Identifier) => {
    // const type = hasOwn(bindingMetadata, raw) && bindingMetadata[raw];
    // x = y
    const isAssignmentLVal =
      parent && parent.type === "AssignmentExpression" && parent.left === id;
    // x++
    const isUpdateArg =
      parent && parent.type === "UpdateExpression" && parent.argument === id;

    // if (inline) {
    //   if (
    //     isConst(type) ||
    //     type === BindingTypes.SETUP_REACTIVE_CONST ||
    //     localVars[raw]
    //   ) {
    //     return raw;
    //   } else if (type === BindingTypes.SETUP_REF) {
    //     return `${raw}.value`;
    //   } else if (type === BindingTypes.SETUP_MAYBE_REF) {
    //     return isAssignmentLVal || isUpdateArg
    //       ? `${raw}.value`
    //       : `${context.helperString(UNREF)}(${raw})`;
    //   } else if (type === BindingTypes.PROPS) {
    //     return genPropsAccessExp(raw);
    //   }
    // }

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
  const ast = parse(`(${rawExp})`).program;
  type QualifiedId = Identifier & PrefixMeta;
  const ids: QualifiedId[] = [];
  const parentStack: Node[] = [];
  const knownIds: Record<string, number> = Object.create(context.identifiers);

  walkIdentifiers(
    ast,
    (node, parent, __, isReferenced, isLocal) => {
      if (isReferenced && !isLocal) {
        node.name = rewriteIdentifier(node.name, parent, node);
      }
      ids.push(node as QualifiedId);
    },
    parentStack,
    knownIds
  );

  const children: CompoundExpressionNode["children"] = [];
  ids.sort((a, b) => a.start - b.start);
  ids.forEach((id, i) => {
    // range is offset by -1 due to the wrapping parens when parsed
    const start = id.start - 1;
    const end = id.end - 1;
    const last = ids[i - 1];
    const leadingText = rawExp.slice(last ? last.end - 1 : 0, start);
    if (leadingText.length) {
      children.push(leadingText);
    }

    const source = rawExp.slice(start, end);
    children.push(
      createSimpleExpression(id.name, false, {
        source,
        start: advancePositionWithClone(node.loc.start, source, start),
        end: advancePositionWithClone(node.loc.start, source, end),
      })
    );
    if (i === ids.length - 1 && end < rawExp.length) {
      children.push(rawExp.slice(end));
    }
  });

  let ret;
  if (children.length) {
    ret = createCompoundExpression(children, node.loc);
  } else {
    ret = node;
  }
  ret.identifiers = Object.keys(knownIds);

  return ret;
}

// function isConst(type: unknown) {
//   return (
//     type === BindingTypes.SETUP_CONST || type === BindingTypes.LITERAL_CONST
//   );
// }
