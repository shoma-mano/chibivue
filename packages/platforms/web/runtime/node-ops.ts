export function createElement(tagName: string): Element {
  return document.createElement(tagName);
}

export function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

export function createComment(text: string): Comment {
  return document.createComment(text);
}

export function insertBefore(
  parentNode: Node,
  newNode: Node,
  referenceNode: Node
) {
  parentNode.insertBefore(newNode, referenceNode);
}

export function removeChild(node: Node, child: Node) {
  node.removeChild(child);
}

export function appendChild(node: Node, child: Node) {
  node.appendChild(child);
}

export function parentNode(node: Node) {
  return node.parentNode;
}

export function nextSibling(node: Node) {
  return node.nextSibling;
}

export function tagName(node: Element): string {
  return node.tagName;
}

export function setTextContent(node: Node, text: string) {
  node.textContent = text;
}
