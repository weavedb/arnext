const esbuild = require("esbuild")
const { globPlugin } = require("esbuild-plugin-glob")
const { nodeExternalsPlugin } = require("esbuild-node-externals")
const { dependencies, peerDependencies } = require("./package.json")

esbuild
  .build({
    entryPoints: ["src/index.js", "src/config.js"],
    outdir: "dist/esm",
    bundle: true,
    sourcemap: true,
    format: "esm",
    target: ["es6"],
    loader: { ".js": "jsx" },
    platform: "node",
    plugins: [globPlugin(), nodeExternalsPlugin()],
    external: [].concat.apply(
      [],
      [Object.keys(dependencies), Object.keys(peerDependencies)],
    ),
  })
  .then(async result => {
    console.log("Build complete")
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    entryPoints: ["src/index.js", "src/config.js"],
    outdir: "dist/cjs",
    bundle: true,
    sourcemap: true,
    format: "cjs",
    target: ["es6"],
    loader: { ".js": "jsx" },
    platform: "node",
    plugins: [globPlugin(), nodeExternalsPlugin()],
    external: [].concat.apply(
      [],
      [Object.keys(dependencies), Object.keys(peerDependencies)],
    ),
  })
  .then(async result => {
    console.log("Build complete")
  })
  .catch(() => process.exit(1))
