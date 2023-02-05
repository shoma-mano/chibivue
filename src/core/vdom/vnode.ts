import { Component } from "~/src/type/component";

export class VNode {
  tag?: string;
  attrs?: { [key: string]: string };
  on?: { [key: string]: Function };
  children?: Array<VNode> | null;
  text?: string;
  componentInstance?: Component; // rendered in this component's scope
}
