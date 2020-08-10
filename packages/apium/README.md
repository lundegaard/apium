<h1 align="center">
apium
</h1>

<h3 align="center">
Redux middleware for event-driven HTTP requests with async/await support.
</h3>

<p align="center">
The best way to build large Redux applications over RESTful APIs. Easy to use with all popular Redux side-effect libraries.
</p>

<p align="center">
  <a href="https://github.com/lundegaard/apium/blob/master/LICENSE">
    <img src="https://flat.badgen.net/badge/license/MIT/blue" alt="MIT License" />
  </a>

  <a href="https://npmjs.com/package/apium">
    <img src="https://flat.badgen.net/npm/v/apium" alt="Version" />
  </a>
</p>

## Installation

Use either of these commands, depending on the package manager you prefer:

```sh
yarn add apium

npm i apium
```

## Quick Start

Add the middleware and the reducer to a Redux store.

```js
import { createStore, applyMiddleware, combineReducers } from "redux"
import { apiumReducer, makeApiumMiddleware } from "apium"

const store = createStore(
  combineReducers({ apium: apiumReducer }),
  applyMiddleware(makeApiumMiddleware()),
)
```

Trigger a request in your React component by dispatching a custom command action.

```js
const UserList = () => {
  const users = useSelector(getUsers)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchUsers())
  }, [])

  return <List items={users} />
}
```

Perform a request based on the custom action.

```js
import { request } from "apium"

// With `redux-saga`.
function* fetchUsersSaga(action) {
  const { payload } = yield putResolve(request({ url: "/users" }, { origin: action }))

  yield put(storeUsers(payload))
}

function* watchFetchUsers() {
  yield takeEvery(ActionTypes.fetchUsers, fetchUsersSaga)
}

// With `redux-observable`.
const fetchUsersEpic = action$ =>
  action$.pipe(
    ofType(ActionTypes.fetchUsers),
    mergeMap(action => request({ url: "/users" }, { origin: action })),
    map(({ payload }) => storeUsers(payload)),
  )

// With `redux-thunk`.
const fetchUsers = () => async dispatch => {
  const { payload } = await dispatch(request({ url: "/users" }, { origin: action }))

  dispatch(storeUsers(payload))
}

// Without any additional libraries.
const fetchUsersMiddleware = ({ dispatch }) => next => async action => {
  next(action)

  if (action.type === ActionTypes.fetchUsers) {
    const { payload } = await dispatch(request({ url: "/users" }, { origin: action }))

    dispatch(storeUsers(payload))
  }
}
```

Use the `isFetching` selector factory.

```js
import { isFetching } from "apium"

const isFetchingUsers = isFetching(ActionTypes.fetchUsers)

const UserManagement = () => {
  const fetchingUsers = useSelector(isFetchingUsers)

  if (fetchingUsers) {
    return <Spinner />
  }

  return <UserList />
}
```

## Core Concepts

You should probably read this entire section before using the library.

### General Request Flow

Suppose we want to fetch all users from a RESTful API.

1. Dispatch a custom command action, e.g. `"FETCH_USERS"`.
2. Listen to all `"FETCH_USERS"` command actions.
3. Dispatch an Apium request action, passing the `"FETCH_USERS"` action as `action.meta.origin`.
4. Let the Apium middleware fetch the data.
5. Listen to actions passing the `isApiumSuccess("FETCH_USERS")` predicate or use the `await` syntax.
6. Store the users to display them.

This flow is slightly simplified when using Redux Thunk, which is not reliant on listening to certain types of actions.

### Await Syntax

When an Apium request is dispatched, the Apium middleware does not use the action as its return value directly. Instead, it adds a `.then` property to the action, making it a thenable. Thenables behave similarly to promises in that they are supported by the `await` syntax.

### Origin Meta Property

It is necessary to pass the `action.meta.origin` property to all Apium requests. This is what makes it possible to use the `isFetching` selector factories. You must always use a custom command action as the origin, i.e. you cannot use Apium actions directly. This is to encourage good coding practices:

1. You shouldn't be using `request()` directly in your components. Instead, you should always dispatch custom actions, such as `fetchUsers()`, for better decoupling and readability.
2. It will make the `isFetching` selector factory usable without any further changes to existing code.

### Authentication

Should you need to automatically attach a JWT as the `Authorization: Bearer <jwt>` HTTP header, you have several options on how to achieve this:

1. Dispatch a `configure({ baseHeaders: { Authorization: "Bearer <jwt>" } })` action.
2. Configure the middleware: `makeApiumMiddleware({ transformRequestAction })`. This allows you to retrieve the JWT from Redux state and modify all request actions to have the JWT included in the header.
3. Write a custom middleware that sits in front of Apium middleware, modifying request actions before they are passed to the next middleware. This also allows you e.g. to pause all requests while a new access token is being fetched, resulting in the coolest authentication setup possible.

## Changelog

See the [CHANGELOG.md](CHANGELOG.md) file.

## License

All packages are distributed under the MIT license. See the license [here](https://github.com/lundegaard/apium/blob/master/LICENSE).
