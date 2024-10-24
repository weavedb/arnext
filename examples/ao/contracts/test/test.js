import { setup, ok, fail } from "aonote/test/helpers.js"
import { expect } from "chai"
import { AR, AO, Profile, Note, Notebook } from "aonote"

import { resolve } from "path"
import { readFileSync } from "fs"

describe("Atomic Notes", function () {
  this.timeout(0)
  let ao, opt, profile, ar, thumbnail, banner

  before(async () => {
    ;({ thumbnail, banner, opt, ao, ar, profile } = await setup({
      cache: true,
    }))
  })

  it("should create an AO profile", async () => {
    const data = readFileSync(
      resolve(import.meta.dirname, "../lua/arnext.lua"),
      "utf8",
    )
    const { pid } = await ao.spwn({})
    console.log(pid)
    await ao.wait({ pid })
    const { mid } = await ao.load({ pid, data })

    ok(
      await ao.msg({
        pid,
        act: "Post",
        tags: {
          Title: "title",
          Description: "description",
          Image: "EUDSYKInG5Px-SdwHXEjJp_Qjc_Qprk9mJl5dSeq7io",
        },
        getData: "posted!",
      }),
    )
    const { out } = await ao.dry({
      pid,
      act: "List",
      get: { data: true, json: true },
    })

    const { out: post } = await ao.dry({
      pid,
      act: "Get",
      tags: { ID: out[0].id },
      get: { data: true, json: true },
    })

    expect(out[0]).to.eql(post)

    await ao.msg({
      pid,
      act: "Post",
      tags: {
        Title: "title2",
        Description: "description2",
        Image: "EUDSYKInG5Px-SdwHXEjJp_Qjc_Qprk9mJl5dSeq7io",
      },
    })

    await ao.msg({
      pid,
      act: "Post",
      tags: {
        Title: "title3",
        Description: "description3",
        Image: "EUDSYKInG5Px-SdwHXEjJp_Qjc_Qprk9mJl5dSeq7io",
      },
    })

    const { out: out2 } = await ao.dry({
      pid,
      act: "List",
      get: { data: true, json: true },
    })

    const { out: out3 } = await ao.dry({
      pid,
      act: "List",
      tags: { Limit: "1" },
      get: { data: true, json: true },
    })

    expect(out3).to.eql([out2[0]])

    const { out: out4 } = await ao.dry({
      pid,
      act: "List",
      tags: { Limit: "1", Start: out3[0].id },
      get: { data: true, json: true },
    })
    expect(out4).to.eql([out2[1]])
    ok(
      await ao.msg({
        pid,
        act: "Delete",
        tags: { ID: out2[2].id },
        getData: "deleted!",
      }),
    )

    const { out: out5 } = await ao.dry({
      pid,
      act: "List",
      get: { data: true, json: true },
    })
    expect(out5.length).to.eql(2)
  })
})
