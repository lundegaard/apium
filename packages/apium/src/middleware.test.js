import { applyMiddleware, combineReducers, createStore } from "redux"

import makeApiumMiddleware from "./middleware"
import apiumReducer from "./reducer"
import { request } from "./actions"
import { getLastFetchedAtByOriginType, getPendingRequestsByOriginType } from "./selectors"
import { getLocalRequestId } from "./utils"

const makeStore = (configuration, extraMiddleware) =>
  createStore(
    combineReducers({ apium: apiumReducer }),
    applyMiddleware(
      makeApiumMiddleware(configuration),
      ...(extraMiddleware ? [extraMiddleware] : []),
    ),
  )

const fooOrigin = { type: "foo" }
const fooBarPayload = { foo: "bar" }
const fooBarSerialized = JSON.stringify(fooBarPayload)

const jsonOptions = { headers: { "content-type": "application/json" } }

describe("makeApiumMiddleware", () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it("is able to request data via the promise API", async () => {
    fetch.mockResponseOnce(fooBarSerialized, jsonOptions)
    const store = makeStore()
    const result = await store.dispatch(request({ url: "/" }, { origin: fooOrigin }))
    expect(result.payload).toEqual({ foo: "bar" })
  })

  it("performs a routine that stores the `lastFetchedAt` value", async () => {
    fetch.mockResponseOnce(fooBarSerialized, jsonOptions)
    const store = makeStore()
    await store.dispatch(request({ url: "/" }, { origin: fooOrigin }))
    expect(getLastFetchedAtByOriginType(fooOrigin.type, store.getState())).toBeDefined()
  })

  it("stores pending requests by `localRequestId`", async () => {
    jest.useFakeTimers()

    fetch.mockResponseOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ body: fooBarSerialized }), 1000)),
      jsonOptions,
    )

    const store = makeStore()
    const requestAction = store.dispatch(request({ url: "/" }, { origin: fooOrigin }))

    const pendingRequests = getPendingRequestsByOriginType(fooOrigin.type, store.getState())
    const pendingRequest = pendingRequests[getLocalRequestId(requestAction)]

    expect(pendingRequest).toBeDefined()
    expect(pendingRequest).toBe(requestAction)

    jest.runAllTimers()

    await requestAction

    expect(getPendingRequestsByOriginType(fooOrigin.type, store.getState())).toEqual({})

    jest.useRealTimers()
  })

  it("supports retrying resulting in a success", async () => {
    fetch.mockResponses(
      [null, { status: 400 }],
      [null, { status: 400 }],
      [fooBarSerialized, jsonOptions],
    )

    const store = makeStore()
    const result = await store.dispatch(
      request({ url: "/", retryTimes: 2, retryInterval: 0 }, { origin: fooOrigin }),
    )

    expect(result.payload).toEqual(fooBarPayload)
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it("supports retrying resulting in a failure", async () => {
    expect.assertions(2)

    fetch.mockResponses(
      [null, { status: 400 }],
      [null, { status: 400 }],
      [fooBarSerialized, jsonOptions],
    )

    const store = makeStore()

    try {
      await store.dispatch(
        request({ url: "/", retryTimes: 1, retryInterval: 0 }, { origin: fooOrigin }),
      )
    } catch (error) {
      expect(error).toBeDefined()
    }

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it("does not support await natively when used with bad middleware", async () => {
    fetch.mockResponseOnce(fooBarSerialized, jsonOptions)
    const store = makeStore(undefined, () => () => () => {})
    const result = store.dispatch(request({ url: "/" }, { origin: fooOrigin }))
    expect(result).not.toBeDefined()
  })

  it("supports the `alwaysReturnThenable` option for use with bad middleware", async () => {
    fetch.mockResponseOnce(fooBarSerialized, jsonOptions)
    const store = makeStore({ alwaysReturnThenable: true }, () => () => () => {})
    const result = await store.dispatch(request({ url: "/" }, { origin: fooOrigin }))
    expect(result.payload).toEqual({ foo: "bar" })
  })
})
