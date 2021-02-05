import invariant from "invariant"
import { v4 as uuid } from "uuid"
import { identity, isNil, reject } from "ramda"

import { errorEvent, successEvent } from "./actions"
import {
  getLocalRequestId,
  getOrigin,
  isAnyApiumError,
  isAnyApiumRequest,
  isAnyApiumResponse,
  isAnyApiumSuccess,
  makeThenableArgumentsStore,
  setLocalRequestId,
  sleep,
} from "./utils"
import { getConfiguration } from "./selectors"
import * as Defaults from "./defaults"

const makeApiumMiddleware = (configuration = {}) => {
  const thenableArgumentsStore = makeThenableArgumentsStore()

  return ({ dispatch, getState }) => {
    const performRequest = async originalRequestAction => {
      const {
        baseUrl = "",
        baseHeaders = {},
        baseRetryTimes = Defaults.retryTimes,
        baseRetryInterval = Defaults.retryInterval,
        baseFetchOptions = {},
        parseResponse = Defaults.parseResponse,
        isResponseSuccess = Defaults.isResponseSuccess,
        transformRequestAction = identity,
        getContentType = Defaults.getContentType,
        getBody = Defaults.getBody,
      } = {
        ...configuration,
        ...getConfiguration(getState()),
      }

      const requestAction = transformRequestAction(originalRequestAction, getState())

      const {
        url: endpoint,
        method = Defaults.method,
        headers = {},
        retryTimes = baseRetryTimes,
        retryInterval = baseRetryInterval,
        fetchOptions = baseFetchOptions,
      } = requestAction.payload

      const origin = getOrigin(requestAction)

      invariant(origin.type, "Apium requests must have the origin action in `action.meta.origin`.")

      invariant(
        !isAnyApiumResponse(origin),
        "Apium request's `action.meta.origin` type cannot be an apium response event.",
      )

      const makeBeforeResponseMeta = (additionalMeta = {}) =>
        reject(isNil, {
          originalRequest: originalRequestAction,
          request: requestAction,
          timestamp: Date.now(),
          ...origin.meta,
          ...originalRequestAction.meta,
          ...requestAction.meta,
          ...additionalMeta,
        })

      const url = baseUrl + endpoint

      const performFetch = async () => {
        let response

        try {
          response = await fetch(url, {
            method,
            headers: reject(isNil, {
              "Content-Type": getContentType(requestAction),
              ...baseHeaders,
              ...headers,
            }),
            body: getBody(requestAction),
            ...fetchOptions,
          })
        } catch (error) {
          console.error(error)

          return errorEvent(error.toString(), makeBeforeResponseMeta())
        }

        const { statusText, status: statusCode } = response

        const makeAfterResponseMeta = (additionalMeta = {}) =>
          makeBeforeResponseMeta(
            reject(isNil, {
              statusCode,
              statusText,
              ...additionalMeta,
            }),
          )

        let parsedResponse

        try {
          parsedResponse = await parseResponse(response)
        } catch (error) {
          console.error()

          return errorEvent(error.toString(), makeAfterResponseMeta())
        }

        const [payload, meta] = parsedResponse ?? []

        return isResponseSuccess(response)
          ? successEvent(payload, makeAfterResponseMeta(meta))
          : errorEvent(payload, makeAfterResponseMeta(meta))
      }

      let fulfilledEvent

      // NOTE: <= because we need to call `performFetch()` at least once.
      // eslint-disable-next-line no-plusplus
      for (let retryCounter = 0; retryCounter <= retryTimes; retryCounter++) {
        // NOTE: This rule is for losers.
        /* eslint-disable no-await-in-loop */
        if (retryCounter) {
          await sleep(retryInterval)
        }

        fulfilledEvent = await performFetch()

        /* eslint-enable no-await-in-loop */
        if (isAnyApiumSuccess(fulfilledEvent)) {
          return dispatch(fulfilledEvent)
        }
      }

      return dispatch(fulfilledEvent)
    }

    return next => action => {
      if (isAnyApiumRequest(action)) {
        const localRequestId = uuid()

        const requestAction = {
          ...setLocalRequestId(localRequestId, action),
          // eslint-disable-next-line no-shadow
          then: (resolve, reject) => {
            thenableArgumentsStore.set(localRequestId, { resolve, reject })
          },
        }

        const innerMiddlewareReturnValue = next(requestAction)
        performRequest(requestAction)

        // NOTE: People sometimes don't pay attention to return values of custom middleware.
        // `alwaysReturnThenable` can thus be used to ensure that inner middleware won't modify
        // our return value. This is for very advanced usage and should be used as a last resort.
        return configuration.alwaysReturnThenable ? requestAction : innerMiddlewareReturnValue
      }

      const innerMiddlewareReturnValue = next(action)

      if (isAnyApiumSuccess(action)) {
        const thenable = thenableArgumentsStore.get(getLocalRequestId(action))

        if (thenable) {
          thenable.resolve(action)
        }
      }

      if (isAnyApiumError(action)) {
        const thenable = thenableArgumentsStore.get(getLocalRequestId(action))

        if (thenable) {
          thenable.reject(action)
        }
      }

      return innerMiddlewareReturnValue
    }
  }
}

export default makeApiumMiddleware
