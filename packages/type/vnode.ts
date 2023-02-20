export interface VNodeData {
  on?: { [key: string]: Function };
  attrs?: { [key: string]: string };
  [key: string]: any;
}
