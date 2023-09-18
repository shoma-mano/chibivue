import { DirectiveTransform, NodeTransform } from "./transform";

export type CompilerOptions = {
  isBrowser?: boolean;
} & TransformOptions;

export interface TransformOptions {
  nodeTransforms?: NodeTransform[];
  directiveTransforms?: Record<string, DirectiveTransform | undefined>;
}
