import { either } from "ramda"

import { isPlainObject } from "./utils"

export const retryTimes = 0
export const retryInterval = 1000

export const method = "GET"

export const parseResponse = async response => {
  const contentType = response.headers.get("content-type")

  return [
    contentType && contentType.includes("application/json")
      ? await response.json()
      : await response.blob(),
  ]
}

export const isResponseSuccess = response => response.ok

const isBodyStructuredAndSerializable = either(isPlainObject, Array.isArray)

export const getBody = ({ payload: { body } }) =>
  isBodyStructuredAndSerializable(body) ? JSON.stringify(body) : body

export const getContentType = ({ payload: { body } }) =>
  isBodyStructuredAndSerializable(body) ? "application/json" : null
