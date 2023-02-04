import { Vue } from "~/src";

export class VNode {
  tag?: string;
  attrs?: { [key: string]: string };
  on?: { [key: string]: Function };
  children?: Array<VNode> | null;
  text?: string;
  componentInstance?: Vue; // rendered in this component's scope
}
