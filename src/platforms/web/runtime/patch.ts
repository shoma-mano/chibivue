import { createPatchFunction } from "~/src/core/vdom/patch";
import * as nodeOps from "~/src/platforms/web/runtime/node-ops";

export const patch = createPatchFunction({ nodeOps });
