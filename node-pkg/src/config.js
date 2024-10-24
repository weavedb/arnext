const { readdirSync } = require("fs")
const { resolve, extname } = require("path")

const arnext = config => {
  const isArweave = process.env.NEXT_PUBLIC_DEPLOY_TARGET === "arweave"
  if (isArweave) {
    const pages = resolve(process.env.PWD, "pages")
    const dirs = readdirSync(pages, { withFileTypes: true, recursive: true })
    let routes = []
    let not_found = null
    for (let v of dirs) {
      const ext = extname(v.name)
      const p = v.path.replace(pages, "")
      const n = v.name.replace(ext, "")
      if (
        v.isFile() &&
        [".js", ".ts", ".jsx", ".tsx"].includes(ext) &&
        !(!p && ["_app", "_document"].includes(n))
      ) {
        if (!p && v.name === "404.js") {
          not_found = { page: "404", path: "*" }
        } else {
          let _p = (p === "" ? "/" : p + "/") + n
          let __p = []
          let sp = _p.split("/")
          let i = 0
          for (const v2 of sp) {
            if (v2 !== "") {
              if (v2.match(/^\[.+\]$/)) {
                __p.push(v2.replace(/\[(.+)\]/, ":$1"))
              } else if (n !== "index" || i !== sp.length - 1) {
                __p.push(v2)
              }
            }
            i++
          }
          routes.push({
            page: _p.replace(/^\//, ""),
            path: "/" + __p.join("/"),
          })
        }
      }
    }
    if (not_found) routes.push(not_found)
    process.env.NEXT_PUBLIC_ROUTES = JSON.stringify(routes)
    let env = {}
    for (const k in process.env) {
      if (/^NEXT_PUBLIC_/.test(k)) env[k] = process.env[k]
    }
    config = {
      ...config,
      ...{
        output: "export",
        publicRuntimeConfig: env,
        images: { unoptimized: true },
      },
    }
  }
  return config
}

module.exports = arnext
