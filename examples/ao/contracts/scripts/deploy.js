import { AO } from "aonote"
import { resolve } from "path"
import { readFileSync } from "fs"
const main = async () => {
  const data = readFileSync(
    resolve(import.meta.dirname, "../lua/arnext.lua"),
    "utf8",
  )
  const jwk = JSON.parse(
    readFileSync(resolve(process.cwd(), process.argv[2]), "utf8"),
  )
  const ao = await new AO().init(jwk)
  const { pid } = await ao.spwn({})
  await ao.wait({ pid })
  const { mid } = await ao.load({ pid, data })
  console.log(`deployed:`, pid)
}

main()
