import { T, any, assocPath, curry, either, path, pathEq, propEq } from "ramda"

import { ActionTypes } from "./actions"

const typeEq = propEq("type")

const isRequest = typeEq(ActionTypes.request)
const isSuccessEvent = typeEq(ActionTypes.success)
const isErrorEvent = typeEq(ActionTypes.error)
const isResponseEvent = either(isSuccessEvent, isErrorEvent)

const originPath = ["meta", "origin"]
const originTypePath = [...originPath, "type"]

export const getOrigin = path(originPath)
export const getOriginType = path(originTypePath)
export const originTypeEq = pathEq(originTypePath)

const localRequestIdPath = ["meta", "localRequestId"]

export const setLocalRequestId = assocPath(localRequestIdPath)
export const getLocalRequestId = path(localRequestIdPath)

export const getRequest = path(["meta", "request"])
export const getTimestamp = path(["meta", "timestamp"])

const isApiumActionMatched = (criterion, action) => {
  if (typeof criterion === "function") {
    return criterion(action)
  }

  return any(type => originTypeEq(type, action), Array.isArray(criterion) ? criterion : [criterion])
}

export const isApiumRequest = curry(
  (criterion, action) => isRequest(action) && isApiumActionMatched(criterion, action),
)

export const isApiumSuccess = curry(
  (criterion, action) => isSuccessEvent(action) && isApiumActionMatched(criterion, action),
)

export const isApiumError = curry(
  (criterion, action) => isErrorEvent(action) && isApiumActionMatched(criterion, action),
)

export const isApiumResponse = curry(
  (criterion, action) => isResponseEvent(action) && isApiumActionMatched(criterion, action),
)

export const isAnyApiumRequest = isApiumRequest(T)
export const isAnyApiumSuccess = isApiumSuccess(T)
export const isAnyApiumError = isApiumError(T)
export const isAnyApiumResponse = isApiumResponse(T)

export const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout))

export const isPlainObject = value =>
  value != null && Object.getPrototypeOf(value) === Object.prototype

export const makeThenableArgumentsStore = () => {
  const thenableArgumentsByLocalRequestId = {}

  const setThenableArguments = (localRequestId, thenableArguments) => {
    thenableArgumentsByLocalRequestId[localRequestId] = thenableArguments
  }

  const getThenableArguments = localRequestId => {
    const thenableArguments = thenableArgumentsByLocalRequestId[localRequestId]
    delete thenableArgumentsByLocalRequestId[localRequestId]

    return thenableArguments
  }

  return {
    set: setThenableArguments,
    get: getThenableArguments,
  }
}
