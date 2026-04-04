import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: false,
    clean: true,
    minify: true,
    sourcemap: true,
    splitting: false,
    target: "node20",
    shims: true,
    keepNames: true,
    external: [
        "fs",
        "path",
        "os",
        "crypto",
        "events",
        "stream",
        "http",
        "https",
        "url",
        "util",
        "zlib",
        "@devio/boilerplate-generator",
        "@devio/zod-utils"
    ],
    esbuildOptions(options: any) {
        options.drop = ["console", "debugger"];
    },
});
