import {
  getOrigin,
  getOriginType,
  isAnyApiumError,
  isAnyApiumRequest,
  isAnyApiumResponse,
  isAnyApiumSuccess,
  isApiumError,
  isApiumRequest,
  isApiumResponse,
  isApiumSuccess,
  isPlainObject,
  originTypeEq,
} from "./utils"
import { errorEvent, request, successEvent } from "./actions"

const origin = { type: "origin" }

const testRequest = request({ url: "/test" }, { origin })
const testSuccess = successEvent(null, { origin })
const testError = errorEvent(null, { origin })

describe("isApiumRequest", () => {
  it("matches an apium request by origin type", () => {
    expect(isApiumRequest("origin", testRequest)).toBe(true)
  })

  it("matches an apium request by array of origin types", () => {
    expect(isApiumRequest(["random", "origin"], testRequest)).toBe(true)
  })

  it("matches an apium request by predicate", () => {
    expect(isApiumRequest(action => action.meta.origin.type === "origin", testRequest)).toBe(true)
  })

  it("does not match a non-apium request", () => {
    expect(isApiumRequest("origin", { type: "foo", meta: { origin: { type: "origin" } } })).toBe(
      false,
    )
  })

  it("does not match a request with wrong origin type", () => {
    expect(isApiumRequest("foo", testRequest)).toBe(false)
  })
})

describe("isAnyApiumRequest", () => {
  it("matches an apium request", () => {
    expect(isAnyApiumRequest(testRequest)).toBe(true)
  })

  it("does not match a non-apium request", () => {
    expect(isAnyApiumRequest({ type: "foo", meta: { origin: { type: "origin" } } })).toBe(false)
  })
})

describe("isApiumSuccess", () => {
  it("matches an apium success event", () => {
    expect(isApiumSuccess("origin", testSuccess)).toBe(true)
  })

  it("matches an apium success event by array of origin types", () => {
    expect(isApiumSuccess(["random", "origin"], testSuccess)).toBe(true)
  })

  it("matches an apium success event by predicate", () => {
    expect(isApiumSuccess(action => action.meta.origin.type === "origin", testSuccess)).toBe(true)
  })

  it("does not match a non-apium success event", () => {
    expect(isApiumSuccess("origin", { type: "foo", meta: { origin: { type: "origin" } } })).toBe(
      false,
    )
  })

  it("does not match a success event with wrong origin type", () => {
    expect(isApiumSuccess("foo", testSuccess)).toBe(false)
  })
})

describe("isAnyApiumSuccess", () => {
  it("matches an apium success event", () => {
    expect(isAnyApiumSuccess(testSuccess)).toBe(true)
  })

  it("does not match a non-apium success event", () => {
    expect(isAnyApiumSuccess({ type: "foo", meta: { origin: { type: "origin" } } })).toBe(false)
  })
})

describe("isApiumError", () => {
  it("matches an apium error event", () => {
    expect(isApiumError("origin", testError)).toBe(true)
  })

  it("matches an apium error event by array of origin types", () => {
    expect(isApiumError(["random", "origin"], testError)).toBe(true)
  })

  it("matches an apium error event by predicate", () => {
    expect(isApiumError(action => action.meta.origin.type === "origin", testError)).toBe(true)
  })

  it("does not match a non-apium error event", () => {
    expect(isApiumError("origin", { type: "foo", meta: { origin: { type: "origin" } } })).toBe(
      false,
    )
  })

  it("does not match an error event with wrong origin type", () => {
    expect(isApiumError("foo", testError)).toBe(false)
  })
})

describe("isAnyApiumError", () => {
  it("matches an apium error event", () => {
    expect(isAnyApiumError(testError)).toBe(true)
  })

  it("does not match a non-apium error event", () => {
    expect(isAnyApiumError({ type: "foo", meta: { origin: { type: "origin" } } })).toBe(false)
  })
})

describe("isApiumResponse", () => {
  it("matches an apium response event", () => {
    expect(isApiumResponse("origin", testSuccess)).toBe(true)
    expect(isApiumResponse("origin", testError)).toBe(true)
  })

  it("matches an apium response event by array of origin types", () => {
    expect(isApiumResponse(["random", "origin"], testSuccess)).toBe(true)
    expect(isApiumResponse(["random", "origin"], testError)).toBe(true)
  })

  it("matches an apium response event by predicate", () => {
    expect(isApiumResponse(action => action.meta.origin.type === "origin", testSuccess)).toBe(true)
    expect(isApiumResponse(action => action.meta.origin.type === "origin", testError)).toBe(true)
  })

  it("does not match a non-apium response event", () => {
    expect(isApiumResponse("origin", { type: "foo", meta: { origin: { type: "origin" } } })).toBe(
      false,
    )
  })

  it("does not match a response event with wrong origin type", () => {
    expect(isApiumResponse("foo", testSuccess)).toBe(false)
    expect(isApiumResponse("foo", testError)).toBe(false)
  })
})

describe("isAnyApiumResponse", () => {
  it("matches an apium response event", () => {
    expect(isAnyApiumResponse(testSuccess)).toBe(true)
    expect(isAnyApiumResponse(testError)).toBe(true)
  })

  it("does not match a non-apium response event", () => {
    expect(isAnyApiumResponse({ type: "foo", meta: { origin: { type: "origin" } } })).toBe(false)
  })
})

describe("isPlainObject", () => {
  it("matches plain objects", () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ foo: "bar" })).toBe(true)
    expect(isPlainObject({ foo: { bar: "baz" } })).toBe(true)
  })

  it("does not match other objects", () => {
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject([{ foo: "bar" }])).toBe(false)
    expect(isPlainObject(() => {})).toBe(false)
    // eslint-disable-next-line no-new-wrappers
    expect(isPlainObject(new Boolean(false))).toBe(false)
  })

  it("does not match primitives", () => {
    expect(isPlainObject(undefined)).toBe(false)
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(0)).toBe(false)
    expect(isPlainObject(69)).toBe(false)
    expect(isPlainObject(NaN)).toBe(false)
    expect(isPlainObject("")).toBe(false)
    expect(isPlainObject("foo")).toBe(false)
    expect(isPlainObject(Symbol("bar"))).toBe(false)
    expect(isPlainObject(false)).toBe(false)
    expect(isPlainObject(true)).toBe(false)
  })
})

describe("getOrigin", () => {
  it("retrieves the origin from `action.meta`", () => {
    expect(getOrigin({ meta: { origin } })).toBe(origin)
  })
})

describe("getOriginType", () => {
  it("retrieves the origin type from `action.meta`", () => {
    expect(getOriginType({ meta: { origin } })).toBe(origin.type)
  })
})

describe("originTypeEq", () => {
  it("is a predicate comparing equality with `action.meta.origin.type`", () => {
    expect(originTypeEq(origin.type, { meta: { origin } })).toBe(true)
    expect(originTypeEq("foo", { meta: { origin } })).toBe(false)
  })
})
