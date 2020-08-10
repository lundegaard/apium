import {
  getConfiguration,
  getLastFetchedAtByOriginType,
  getPendingRequests,
  getPendingRequestsByOriginType,
  isFetching,
  isFetchingBy,
} from "./selectors"
import { request } from "./actions"

const fooOrigin = { type: "foo" }
const barOrigin = { type: "bar" }

const fooRequest = request({ url: "/foo" }, { origin: fooOrigin })
const barRequest = request({ url: "/bar" }, { origin: barOrigin })

const state = {
  apium: {
    pendingRequests: {
      foo: {
        localRequestIdFoo: fooRequest,
      },
      bar: {
        localRequestIdBar: barRequest,
      },
      baz: {},
    },
    configuration: {
      foo: "bar",
    },
    lastFetchedAt: {
      foo: 123456,
    },
  },
}

describe("isFetching", () => {
  it("retrieves fetching state by origin type", () => {
    const isFetchingFoo = isFetching(fooOrigin.type)
    expect(isFetchingFoo(state)).toBe(true)

    const isFetchingBar = isFetching(barOrigin.type)
    expect(isFetchingBar(state)).toBe(true)

    const isFetchingBaz = isFetching("baz")
    expect(isFetchingBaz(state)).toBe(false)

    const isFetchingQux = isFetching("qux")
    expect(isFetchingQux(state)).toBe(false)
  })
})

describe("isFetchingBy", () => {
  it("retrieves fetching state by origin type and predicate", () => {
    const isFetchingFooFoo = isFetchingBy(fooOrigin.type, action => action.payload.url === "/foo")
    expect(isFetchingFooFoo(state)).toBe(true)

    const isFetchingFooBar = isFetchingBy(fooOrigin.type, action => action.payload.url === "/bar")
    expect(isFetchingFooBar(state)).toBe(false)
  })
})

describe("getPendingRequests", () => {
  it("retrieves structured pending requests from state", () => {
    expect(getPendingRequests(state)).toBe(state.apium.pendingRequests)
  })
})

describe("getPendingRequestsByOriginType", () => {
  it("retrieves structured pending requests by origin type from state", () => {
    expect(getPendingRequestsByOriginType(fooOrigin.type, state)).toBe(
      state.apium.pendingRequests[fooOrigin.type],
    )
  })
})

describe("getConfiguration", () => {
  it("retrieves configuration from state", () => {
    expect(getConfiguration(state)).toBe(state.apium.configuration)
  })
})

describe("getLastFetchedAtByOriginType", () => {
  it("retrieves `lastFetchedAt` by origin type from state", () => {
    expect(getLastFetchedAtByOriginType(fooOrigin.type, state)).toBe(
      state.apium.lastFetchedAt[fooOrigin.type],
    )
  })
})
