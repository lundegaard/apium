import { ActionTypes, configure, errorEvent, request, retryEvent, successEvent } from "./actions"

describe("ActionTypes", () => {
  it("is an object of strings", () => {
    Object.values(ActionTypes).forEach(type => expect(typeof type).toBe("string"))
  })

  it("has values matching the keys", () => {
    Object.entries(ActionTypes).forEach(([key, value]) =>
      expect(value.toLowerCase()).toContain(key),
    )
  })
})

describe("request", () => {
  it("accepts payload and meta", () => {
    const action = request("foo", "bar")

    expect(action.type).toBe(ActionTypes.request)
    expect(action.payload).toBe("foo")
    expect(action.meta).toBe("bar")
  })
})

describe("successEvent", () => {
  it("accepts payload and meta", () => {
    const action = successEvent("foo", "bar")

    expect(action.type).toBe(ActionTypes.success)
    expect(action.payload).toBe("foo")
    expect(action.meta).toBe("bar")
  })
})

describe("errorEvent", () => {
  it("accepts payload and meta", () => {
    const action = errorEvent("foo", "bar")

    expect(action.type).toBe(ActionTypes.error)
    expect(action.payload).toBe("foo")
    expect(action.meta).toBe("bar")
  })
})

describe("configure", () => {
  it("accepts payload", () => {
    const action = configure("foo")

    expect(action.type).toBe(ActionTypes.configure)
    expect(action.payload).toBe("foo")
  })
})

describe("retryEvent", () => {
  it("accepts payload", () => {
    const action = retryEvent("foo", "bar")

    expect(action.type).toBe(ActionTypes.retry)
    expect(action.payload).toBe("foo")
    expect(action.meta).toBe("bar")
  })
})
