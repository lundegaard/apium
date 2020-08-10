import {
  complement,
  compose,
  curry,
  defaultTo,
  either,
  filter,
  isEmpty,
  isNil,
  o,
  path,
  prop,
} from "ramda"

const getSlice = prop("apium")

const isNotNilNorEmpty = complement(either(isNil, isEmpty))

export const getPendingRequests = o(prop("pendingRequests"), getSlice)

export const getPendingRequestsByOriginType = curry((originType, state) =>
  o(prop(originType), getPendingRequests)(state),
)

// NOTE: Not implemented via `isFetchingBy` and `T` as the `predicate` due to performance reasons.
export const isFetching = curry((originType, state) =>
  o(isNotNilNorEmpty, getPendingRequestsByOriginType(originType))(state),
)

export const isFetchingBy = curry((originType, predicate, state) =>
  compose(
    isNotNilNorEmpty,
    filter(predicate),
    defaultTo({}),
    getPendingRequestsByOriginType(originType),
  )(state),
)

export const getConfiguration = o(prop("configuration"), getSlice)

export const getLastFetchedAtByOriginType = curry((originType, state) =>
  o(path(["lastFetchedAt", originType]), getSlice)(state),
)
