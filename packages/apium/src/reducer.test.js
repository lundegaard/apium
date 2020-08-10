import { isEmpty } from "ramda"

import apiumReducer, { initialState } from "./reducer"
import { configure, errorEvent, request, successEvent } from "./actions"
import { setLocalRequestId } from "./utils"

const fooRequestId = "fooRequestId"
const fooOrigin = { type: "foo" }
const fooRequest = setLocalRequestId(fooRequestId, request({ url: "/foo" }, { origin: fooOrigin }))
const fooSuccess = successEvent(null, { request: fooRequest, timestamp: 69, ...fooRequest.meta })
const fooError = errorEvent("failure", { request: fooRequest, ...fooRequest.meta })

describe("initialState", () => {
  it("is an object", () => {
    expect(initialState).toBeInstanceOf(Object)
  })
})

describe("apiumReducer", () => {
  it("returns the initial state for unknown actions", () => {
    expect(apiumReducer(undefined, { type: "foo" })).toBe(initialState)
  })

  it("stores a request action in pending requests", () => {
    const nextState = apiumReducer(initialState, fooRequest)
    expect(nextState.pendingRequests[fooOrigin.type][fooRequestId]).toBe(fooRequest)
  })

  it("removes a request action from pending requests upon a success event", () => {
    const stateWithPendingRequests = apiumReducer(initialState, fooRequest)
    expect(isEmpty(stateWithPendingRequests.pendingRequests[fooOrigin.type])).toBe(false)
    const stateWithoutPendingRequests = apiumReducer(stateWithPendingRequests, fooSuccess)
    expect(isEmpty(stateWithoutPendingRequests.pendingRequests[fooOrigin.type])).toBe(true)
  })

  it("removes a request action from pending requests upon an error event", () => {
    const stateWithPendingRequests = apiumReducer(initialState, fooRequest)
    expect(isEmpty(stateWithPendingRequests.pendingRequests[fooOrigin.type])).toBe(false)
    const stateWithoutPendingRequests = apiumReducer(stateWithPendingRequests, fooError)
    expect(isEmpty(stateWithoutPendingRequests.pendingRequests[fooOrigin.type])).toBe(true)
  })

  it("stores `lastFetchedAt` upon a success event", () => {
    const nextState = apiumReducer(initialState, fooSuccess)
    expect(nextState.lastFetchedAt[fooOrigin.type]).toBe(69)
  })

  it("stores `errors` upon an error event", () => {
    const nextState = apiumReducer(initialState, fooError)
    expect(nextState.errors[fooOrigin.type]).toBe("failure")
  })

  it("stores payload of a configure action as-is", () => {
    const nextState = apiumReducer(initialState, configure({ foo: "bar" }))
    expect(nextState.configuration).toEqual({ foo: "bar" })
  })
})
