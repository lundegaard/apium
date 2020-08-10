const prefix = "@apium"

export const ActionTypes = {
  request: `${prefix}/REQUEST`,
  success: `${prefix}/SUCCESS`,
  error: `${prefix}/ERROR`,
  configure: `${prefix}/CONFIGURE`,
  retry: `${prefix}/RETRY`,
}

export const request = (payload, meta) => ({ type: ActionTypes.request, payload, meta })

export const successEvent = (payload, meta) => ({ type: ActionTypes.success, payload, meta })

export const errorEvent = (payload, meta) => ({ type: ActionTypes.error, payload, meta })

export const configure = payload => ({ type: ActionTypes.configure, payload })

export const retryEvent = (payload, meta) => ({ type: ActionTypes.retry, payload, meta })
