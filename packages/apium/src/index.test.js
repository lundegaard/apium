import { isEmpty } from "ramda"

import * as Apium from "."

describe("index", () => {
  it("withstands a smoke test", () => {
    expect(isEmpty(Apium)).toBe(false)
  })
})
