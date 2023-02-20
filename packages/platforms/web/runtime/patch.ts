import { createPatchFunction } from "../../../core/vdom/patch";
import * as nodeOps from "../../../platforms/web/runtime/node-ops";

export const patch = createPatchFunction({ nodeOps });
