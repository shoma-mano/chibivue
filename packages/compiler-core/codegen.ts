import { V_MODEL_TEXT } from "../compiler-dom/runtimeHelpers";
import { isArray, isString, isSymbol } from "../shared";
import {
  ArrayExpression,
  CallExpression,
  CompoundExpressionNode,
  ExpressionNode,
  FunctionExpression,
  InterpolationNode,
  JSChildNode,
  NodeTypes,
  ObjectExpression,
  RootNode,
  SimpleExpressionNode,
  TemplateChildNode,
  TextNode,
  VNodeCall,
} from "./ast";
import { CodegenOptions } from "./options";
import {
  CREATE_ELEMENT_VNODE,
  CREATE_VNODE,
  FRAGMENT,
  MERGE_PROPS,
  NORMALIZE_CLASS,
  NORMALIZE_PROPS,
  NORMALIZE_STYLE,
  RENDER_LIST,
  RESOLVE_COMPONENT,
  TO_DISPLAY_STRING,
  TO_HANDLER_KEY,
  UNREF,
  WITH_DIRECTIVES,
  helperNameMap,
} from "./runtimeHelpers";
import { toValidAssetId } from "./transforms/transformElement";

const aliasHelper = (s: symbol) => `${helperNameMap[s]}: _${helperNameMap[s]}`;

export interface CodegenResult {
  code: string;
  preamble: string;
  ast: RootNode;
}

type CodegenNode = TemplateChildNode | JSChildNode;

export interface CodegenContext {
  source: string;
  code: string;
  line: number;
  column: number;
  offset: number;
  indentLevel: number;
  runtimeGlobalName: string;
  runtimeModuleName: string;
  inline?: boolean;
  helper(key: symbol): string;
  push(code: string, node?: CodegenNode): void;
  indent(): void;
  deindent(withoutNewLine?: boolean): void;
  newline(): void;
  __BROWSER__: boolean;
}

function createCodegenContext(
  ast: RootNode,
  { __BROWSER__ = false }: CodegenOptions
): CodegenContext {
  const context: CodegenContext = {
    source: ast.loc.source,
    code: ``,
    column: 1,
    line: 1,
    offset: 0,
    indentLevel: 0,
    runtimeGlobalName: `ChibiVue`,
    runtimeModuleName: "chibivue",
    __BROWSER__,
    helper(key) {
      return `_${helperNameMap[key]}`;
    },
    push(code) {
      context.code += code;
    },
    indent() {
      newline(++context.indentLevel);
    },
    deindent(withoutNewLine = false) {
      if (withoutNewLine) {
        --context.indentLevel;
      } else {
        newline(--context.indentLevel);
      }
    },
    newline() {
      newline(context.indentLevel);
    },
  };

  function newline(n: number) {
    context.push("\n" + `  `.repeat(n));
  }

  return context;
}

export function generate(
  ast: RootNode,
  options: CodegenOptions
): CodegenResult {
  const context = createCodegenContext(ast, {
    __BROWSER__: options.__BROWSER__,
  });
  const { push } = context;
  const isSetupInlined = !options.__BROWSER__ && !!options.inline;

  const preambleContext = isSetupInlined
    ? createCodegenContext(ast, options)
    : context;

  genFunctionPreamble(ast, preambleContext);

  const args = ["_ctx"];
  const signature = args.join(", ");

  push(`function render(${signature}) { `);
  context.indent();

  // generate asset resolution statements
  if (ast.components.length) {
    genAssets(ast.components, context);
    context.newline();
  }

  push(`return `);
  if (ast.children) {
    ast.children.forEach((codegenNode) => {
      genNode(codegenNode, context);
    });
  }
  context.deindent();
  push(` }`);

  return {
    ast,
    preamble: isSetupInlined ? preambleContext.code : ``,
    code: context.code,
  };
}

function genFunctionPreamble(ast: RootNode, context: CodegenContext) {
  const { push, newline, runtimeGlobalName, runtimeModuleName, __BROWSER__ } =
    context;

  if (__BROWSER__) {
    push(`const _ChibiVue = ${runtimeGlobalName}\n`);
  } else {
    push(`import * as _ChibiVue from '${runtimeModuleName}'\n`);
  }

  const helpers = [
    CREATE_VNODE,
    CREATE_ELEMENT_VNODE,
    RESOLVE_COMPONENT,
    TO_HANDLER_KEY,
    TO_DISPLAY_STRING,
    MERGE_PROPS,
    NORMALIZE_CLASS,
    NORMALIZE_STYLE,
    NORMALIZE_PROPS,
    FRAGMENT,
    V_MODEL_TEXT,
    WITH_DIRECTIVES,
    RENDER_LIST,
    UNREF,
  ]
    .map(aliasHelper)
    .join(", ");
  push(`const { ${helpers} } = _ChibiVue\n`);
  newline();
  if (__BROWSER__) push(`return `);
}

function genNode(node: CodegenNode | symbol | string, context: CodegenContext) {
  if (isString(node)) {
    context.push(node);
    return;
  }

  if (isSymbol(node)) {
    context.push(context.helper(node));
    return;
  }

  switch (node.type) {
    case NodeTypes.ELEMENT:
    case NodeTypes.FOR: {
      genNode(node.codegenNode!, context);
      break;
    }
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.VNODE_CALL:
      genVNodeCall(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
    case NodeTypes.JS_CALL_EXPRESSION:
      genCallExpression(node, context);
      break;
    case NodeTypes.JS_OBJECT_EXPRESSION:
      genObjectExpression(node, context);
      break;
    case NodeTypes.JS_ARRAY_EXPRESSION:
      genArrayExpression(node, context);
      break;
    case NodeTypes.JS_FUNCTION_EXPRESSION:
      genFunctionExpression(node, context);
      break;
    default: {
      // make sure we exhaust all possible types
      const exhaustiveCheck: never = node;
      return exhaustiveCheck;
    }
  }
}

function genText(node: TextNode, context: CodegenContext) {
  context.push(JSON.stringify(node.content), node);
}

function genExpression(node: SimpleExpressionNode, context: CodegenContext) {
  const { content, isStatic } = node;
  context.push(isStatic ? JSON.stringify(content) : content, node);
}

function genInterpolation(node: InterpolationNode, context: CodegenContext) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(`)`);
}

function genCompoundExpression(
  node: CompoundExpressionNode,
  context: CodegenContext
) {
  for (let i = 0; i < node.children!.length; i++) {
    const child = node.children![i];
    if (isString(child)) {
      context.push(child);
    } else {
      genNode(child, context);
    }
  }
}

function genExpressionAsPropertyKey(
  node: ExpressionNode,
  context: CodegenContext
) {
  const { push } = context;
  if (node.type === NodeTypes.COMPOUND_EXPRESSION) {
    push(`[`);
    genCompoundExpression(node, context);
    push(`]`);
  } else if (node.isStatic) {
    push(JSON.stringify(node.content), node);
  } else {
    push(`[${node.content}]`, node);
  }
}

function genVNodeCall(node: VNodeCall, context: CodegenContext) {
  const { push, helper } = context;
  const { tag, props, children, directives } = node;
  if (directives) {
    push(helper(WITH_DIRECTIVES) + `(`);
  }
  push(helper(CREATE_ELEMENT_VNODE) + `(`, node);
  genNodeList(genNullableArgs([tag, props, children]), context);
  push(`)`);
  if (directives) {
    push(`, `);
    genNode(directives, context);
    push(`)`);
  }
}

function genNullableArgs(args: any[]): CallExpression["arguments"] {
  let i = args.length;
  while (i--) {
    if (args[i] != null) break;
  }
  return args.slice(0, i + 1).map((arg) => arg || `null`);
}

// JavaScript
function genCallExpression(node: CallExpression, context: CodegenContext) {
  const { push, helper } = context;
  const callee = isString(node.callee) ? node.callee : helper(node.callee);
  push(callee + `(`, node);
  genNodeList(node.arguments, context);
  push(`)`);
}

function genObjectExpression(node: ObjectExpression, context: CodegenContext) {
  const { push } = context;
  const { properties } = node;

  if (!properties.length) {
    push(`{}`, node);
    return;
  }

  push(`{ `);
  for (let i = 0; i < properties.length; i++) {
    const { key, value } = properties[i];
    // key
    genExpressionAsPropertyKey(key, context);
    push(`: `);
    // value
    genNode(value, context);
    if (i < properties.length - 1) {
      // will only reach this if it's multilines
      push(`,`);
    }
  }
  push(` }`);
}

function genArrayExpression(node: ArrayExpression, context: CodegenContext) {
  genNodeListAsArray(node.elements as CodegenNode[], context);
}

function genFunctionExpression(
  node: FunctionExpression,
  context: CodegenContext
) {
  const { push, indent, deindent } = context;
  const { params, returns, newline } = node;

  push(`(`, node);
  if (isArray(params)) {
    genNodeList(params, context);
  } else if (params) {
    genNode(params, context);
  }
  push(`) => `);
  if (newline) {
    push(`{`);
    indent();
  }
  if (returns) {
    if (newline) {
      push(`return `);
    }
    if (isArray(returns)) {
      genNodeListAsArray(returns, context);
    } else {
      genNode(returns, context);
    }
  }
  if (newline) {
    deindent();
    push(`}`);
  }
}

function genNodeListAsArray(
  nodes: (string | CodegenNode | TemplateChildNode[])[],
  context: CodegenContext
) {
  context.push(`[`);
  genNodeList(nodes, context);
  context.push(`]`);
}

function genNodeList(
  nodes: (string | CodegenNode | TemplateChildNode[])[],
  context: CodegenContext,
  comma: boolean = true
) {
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      push(node);
    } else if (isArray(node)) {
      genNodeListAsArray(node, context);
    } else {
      genNode(node, context);
    }

    if (i < nodes.length - 1) {
      comma && push(", ");
    }
  }
}

function genAssets(
  assets: string[],
  { helper, push, newline }: CodegenContext
) {
  const resolver = helper(RESOLVE_COMPONENT);
  for (let i = 0; i < assets.length; i++) {
    let id = assets[i];
    const maybeSelfReference = id.endsWith("__self");
    if (maybeSelfReference) {
      id = id.slice(0, -6);
    }
    push(
      `const ${toValidAssetId(id, "component")} = ${resolver}(${JSON.stringify(
        id
      )}${maybeSelfReference ? `, true` : ``})`
    );
    if (i < assets.length - 1) {
      newline();
    }
  }
}
