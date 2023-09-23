import { isString } from "../shared";
import { CREATE_VNODE, FRAGMENT, RENDER_LIST } from "./runtimeHelpers";
import { TransformContext } from "./transform";
import { PropsExpression } from "./transforms/transformElement";
import { ForParseResult } from "./transforms/vFor";

export const enum NodeTypes {
  ROOT,
  ELEMENT,
  TEXT,
  INTERPOLATION,
  SIMPLE_EXPRESSION,

  ATTRIBUTE,
  DIRECTIVE,

  COMPOUND_EXPRESSION,
  FOR,

  // codegen
  VNODE_CALL,
  JS_CALL_EXPRESSION,
  JS_OBJECT_EXPRESSION,
  JS_PROPERTY,
  JS_ARRAY_EXPRESSION,
  JS_FUNCTION_EXPRESSION,
}

export const enum ElementTypes {
  ELEMENT,
  COMPONENT,
  TEMPLATE,
}

export interface Node {
  type: NodeTypes;
  loc: SourceLocation;
}

export type ParentNode = RootNode | ElementNode | ForNode;

export type ExpressionNode = SimpleExpressionNode | CompoundExpressionNode;

export interface SimpleExpressionNode extends Node {
  type: NodeTypes.SIMPLE_EXPRESSION;
  content: string;
  isStatic: boolean;
  identifiers?: string[];
}

export interface CompoundExpressionNode extends Node {
  type: NodeTypes.COMPOUND_EXPRESSION;
  children: (
    | SimpleExpressionNode
    | CompoundExpressionNode
    | InterpolationNode
    | TextNode
    | string
  )[];
  identifiers?: string[];
}

export interface ForNode extends Node {
  type: NodeTypes.FOR;
  source: ExpressionNode;
  valueAlias: ExpressionNode | undefined;
  keyAlias: ExpressionNode | undefined;
  children: TemplateChildNode[];
  parseResult: ForParseResult;
  codegenNode?: ForCodegenNode;
}

export type TemplateTextChildNode = TextNode | InterpolationNode;

export interface VNodeCall extends Node {
  type: NodeTypes.VNODE_CALL;
  tag: string | symbol;
  props: PropsExpression | undefined;
  children:
    | TemplateChildNode[] // multiple children
    | TemplateTextChildNode
    | ForRenderListExpression
    | undefined;
}

export type JSChildNode =
  | VNodeCall
  | CallExpression
  | ObjectExpression
  | ArrayExpression
  | ExpressionNode
  | FunctionExpression;

export interface CallExpression extends Node {
  type: NodeTypes.JS_CALL_EXPRESSION;
  callee: string | symbol;
  arguments: (string | JSChildNode | TemplateChildNode | TemplateChildNode[])[];
}

export interface ObjectExpression extends Node {
  type: NodeTypes.JS_OBJECT_EXPRESSION;
  properties: Array<Property>;
}

export interface Property extends Node {
  type: NodeTypes.JS_PROPERTY;
  key: ExpressionNode;
  value: JSChildNode;
}

export interface ArrayExpression extends Node {
  type: NodeTypes.JS_ARRAY_EXPRESSION;
  elements: Array<string | Node>;
}

export interface FunctionExpression extends Node {
  type: NodeTypes.JS_FUNCTION_EXPRESSION;
  params: ExpressionNode | string | (ExpressionNode | string)[] | undefined;
  returns?: TemplateChildNode | TemplateChildNode[] | JSChildNode;
  newline: boolean;
}

export interface RootNode extends Node {
  type: NodeTypes.ROOT;
  children: TemplateChildNode[];
  codegenNode: (TemplateChildNode | VNodeCall)[] | undefined;
  helpers: Set<symbol>;
}

export type ElementNode = PlainElementNode | TemplateNode;

export interface BaseElementNode extends Node {
  type: NodeTypes.ELEMENT;
  tag: string;
  tagType: ElementTypes;
  props: Array<AttributeNode | DirectiveNode>;
  children: TemplateChildNode[];
  isSelfClosing: boolean;
}

export interface PlainElementNode extends BaseElementNode {
  tagType: ElementTypes.ELEMENT;
  codegenNode: VNodeCall | SimpleExpressionNode | undefined;
}

export interface TemplateNode extends BaseElementNode {
  tagType: ElementTypes.TEMPLATE;
  // TemplateNode is a container type that always gets compiled away
  codegenNode: undefined;
}

export interface TextNode extends Node {
  type: NodeTypes.TEXT;
  content: string;
}

export type TemplateChildNode =
  | ElementNode
  | TextNode
  | InterpolationNode
  | ForNode;

export interface AttributeNode extends Node {
  type: NodeTypes.ATTRIBUTE;
  name: string;
  value: TextNode | undefined;
}

export interface DirectiveNode extends Node {
  type: NodeTypes.DIRECTIVE;
  name: string;
  exp: ExpressionNode | undefined;
  arg: ExpressionNode | undefined;
  modifiers: string[];
}

export interface ForCodegenNode extends VNodeCall {
  isBlock: true;
  tag: typeof FRAGMENT;
  props: undefined;
  children: ForRenderListExpression;
  patchFlag: string;
  disableTracking: boolean;
}

export interface ForRenderListExpression extends CallExpression {
  callee: typeof RENDER_LIST;
  arguments: [ExpressionNode, ForIteratorExpression];
}

export interface ForIteratorExpression extends FunctionExpression {
  returns: VNodeCall;
}

export interface SourceLocation {
  start: Position;
  end: Position;
  source: string;
}

export interface Position {
  offset: number; // from start of file
  line: number;
  column: number;
}

export interface InterpolationNode extends Node {
  type: NodeTypes.INTERPOLATION;
  content: ExpressionNode;
}

export const locStub: SourceLocation = {
  source: "",
  start: { line: 1, column: 1, offset: 0 },
  end: { line: 1, column: 1, offset: 0 },
};

export function createRoot(
  children: TemplateChildNode[],
  loc: SourceLocation = locStub
): RootNode {
  return {
    type: NodeTypes.ROOT,
    children,
    helpers: new Set(),
    codegenNode: undefined,
    loc,
  };
}

export function createVNodeCall(
  context: TransformContext | null,
  tag: VNodeCall["tag"],
  props?: VNodeCall["props"],
  children?: VNodeCall["children"],
  loc: SourceLocation = locStub
): VNodeCall {
  if (context) {
    context.helper(CREATE_VNODE);
  }
  return {
    type: NodeTypes.VNODE_CALL,
    tag,
    props,
    children,
    loc,
  };
}

export function createArrayExpression(
  elements: ArrayExpression["elements"],
  loc: SourceLocation = locStub
): ArrayExpression {
  return {
    type: NodeTypes.JS_ARRAY_EXPRESSION,
    elements,
    loc,
  };
}

export function createObjectExpression(
  properties: ObjectExpression["properties"],
  loc: SourceLocation = locStub
): ObjectExpression {
  return {
    type: NodeTypes.JS_OBJECT_EXPRESSION,
    properties,
    loc,
  };
}

export function createObjectProperty(
  key: Property["key"] | string,
  value: Property["value"],
  loc: SourceLocation = locStub
): Property {
  return {
    type: NodeTypes.JS_PROPERTY,
    key: isString(key) ? createSimpleExpression(key, true) : key,
    value,
    loc,
  };
}

export function createSimpleExpression(
  content: SimpleExpressionNode["content"],
  isStatic: SimpleExpressionNode["isStatic"] = false,
  loc: SourceLocation = locStub
): SimpleExpressionNode {
  return {
    type: NodeTypes.SIMPLE_EXPRESSION,
    isStatic,
    content,
    loc,
  };
}

export function createCompoundExpression(
  children: CompoundExpressionNode["children"],
  loc: SourceLocation = locStub
): CompoundExpressionNode {
  return {
    type: NodeTypes.COMPOUND_EXPRESSION,
    children,
    loc,
  };
}

export function createCallExpression<T extends CallExpression["callee"]>(
  callee: T,
  args: CallExpression["arguments"] = [],
  loc: SourceLocation = locStub
): CallExpression {
  return {
    type: NodeTypes.JS_CALL_EXPRESSION,
    loc,
    callee,
    arguments: args,
  } as CallExpression;
}

export function createFunctionExpression(
  params: FunctionExpression["params"],
  returns: FunctionExpression["returns"] = undefined,
  newline: boolean = false,
  loc: SourceLocation = locStub
): FunctionExpression {
  return {
    type: NodeTypes.JS_FUNCTION_EXPRESSION,
    params,
    returns,
    newline,
    loc,
  };
}
