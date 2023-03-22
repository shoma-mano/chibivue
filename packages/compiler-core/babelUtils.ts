import { Identifier, Node } from "@babel/types";
import { walk } from "estree-walker";

export function walkIdentifiers(
  root: Node,
  onIdentifier: (
    node: Identifier,
    parent: Node,
    parentStack: Node[],
    isReference: boolean,
    isLocal: boolean
  ) => void,
  parentStack: Node[] = [],
  knownIds: Record<string, number> = Object.create(null)
) {
  const rootExp =
    root.type === "Program" &&
    root.body[0].type === "ExpressionStatement" &&
    root.body[0].expression;

  (walk as any)(root, {
    enter(node: Node & { scopeIds?: Set<string> }, parent: Node | undefined) {
      parent && parentStack.push(parent);
      if (node.type === "Identifier") {
        const isLocal = !!knownIds[node.name];
        const isRefed = isReferencedIdentifier(node, parent!);
        onIdentifier(node, parent!, parentStack, isRefed, isLocal);
      } else if (
        node.type === "ObjectProperty" &&
        parent!.type === "ObjectPattern"
      ) {
        (node as any).inPattern = true;
      }
    },
    leave(node: Node & { scopeIds?: Set<string> }, parent: Node | undefined) {
      parent && parentStack.pop();
      if (node !== rootExp && node.scopeIds) {
        for (const id of node.scopeIds) {
          knownIds[id]--;
          if (knownIds[id] === 0) {
            delete knownIds[id];
          }
        }
      }
    },
  });
}

export function isReferencedIdentifier(id: Identifier, parent: Node | null) {
  if (!parent) return true;

  // babel's isReferenced check returns false for ids being assigned to, so we
  switch (parent.type) {
    case "AssignmentExpression":
    case "AssignmentPattern":
      return true;
    case "ObjectPattern":
    case "ArrayPattern":
      return false;
  }

  return false;
}
