import { dissocPath } from "ramda"

import { ActionTypes } from "./actions"
import { getLocalRequestId, getOriginType, getTimestamp } from "./utils"

export const initialState = {
  configuration: {},
  errors: {},
  pendingRequests: {},
  lastFetchedAt: {},
}

const removePendingRequests = (action, state) =>
  dissocPath(["pendingRequests", getOriginType(action), getLocalRequestId(action)], state)

const apiumReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.request: {
      const originType = getOriginType(action)
      const localRequestId = getLocalRequestId(action)

      return {
        ...state,
        pendingRequests: {
          ...state.pendingRequests,
          [originType]: {
            ...state.pendingRequests[originType],
            [localRequestId]: action,
          },
        },
      }
    }
    case ActionTypes.success: {
      return {
        ...removePendingRequests(action, state),
        lastFetchedAt: {
          ...state.lastFetchedAt,
          [getOriginType(action)]: getTimestamp(action),
        },
      }
    }
    case ActionTypes.error: {
      return {
        ...removePendingRequests(action, state),
        errors: {
          ...state.errors,
          [getOriginType(action)]: action.payload,
        },
      }
    }
    case ActionTypes.configure: {
      return {
        ...state,
        configuration: {
          ...state.configuration,
          ...action.payload,
        },
      }
    }
    default: {
      return state
    }
  }
}

export default apiumReducer
