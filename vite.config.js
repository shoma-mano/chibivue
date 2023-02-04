import { defineConfig } from "vite";

export default defineConfig({
	root: `${process.cwd()}/example`,
	resolve: {
		alias: {
			"~": process.cwd(),
		},
	},
});
