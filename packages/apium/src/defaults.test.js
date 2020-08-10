import {
  getBody,
  getContentType,
  isResponseSuccess,
  method,
  parseResponse,
  retryInterval,
  retryTimes,
} from "./defaults"

describe("retryInterval", () => {
  it("is a number", () => {
    expect(typeof retryInterval).toBe("number")
  })
})

describe("retryTimes", () => {
  it("is a number", () => {
    expect(typeof retryTimes).toBe("number")
  })
})

describe("method", () => {
  it("is a string", () => {
    expect(typeof method).toBe("string")
  })
})

describe("getBody", () => {
  it("serializes body if it is an object or an array", () => {
    expect(getBody({ payload: { body: [] } })).toBe("[]")
    expect(getBody({ payload: { body: { foo: "bar" } } })).toBe('{"foo":"bar"}')
  })

  it("does not serialize body if it is not serializable", () => {
    expect(getBody({ payload: { body: getBody } })).toBe(getBody)
  })

  it("does not serialize strings to allow simple `text/plain` usage", () => {
    expect(getBody({ payload: { body: "foo" } })).toBe("foo")
  })
})

describe("getContentType", () => {
  it("returns `application/json` if body is an object or an array", () => {
    expect(getContentType({ payload: { body: [] } })).toBe("application/json")
    expect(getContentType({ payload: { body: { foo: "bar" } } })).toBe("application/json")
  })

  it("returns `null` for other types", () => {
    expect(getContentType({ payload: { body: getBody } })).toBe(null)
    expect(getContentType({ payload: { body: "foo" } })).toBe(null)
    expect(getContentType({ payload: {} })).toBe(null)
  })
})

describe("isResponseSuccess", () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it("returns true for `200 OK`", async () => {
    fetch.mockResponseOnce(JSON.stringify({ foo: "bar" }, { status: 200 }))
    const response = await fetch("/")
    expect(isResponseSuccess(response)).toBe(true)
  })

  it("returns false for `400 Bad Request`", async () => {
    fetch.mockResponseOnce(JSON.stringify({ foo: "bar" }), { status: 400 })
    const response = await fetch("/")
    expect(response.ok).toBe(false)
  })
})

describe("parseResponse", () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it("returns JSON payload when the content type header is set accordingly", async () => {
    fetch.mockResponseOnce(JSON.stringify({ foo: "bar" }), {
      headers: { "content-type": "application/json" },
    })

    const response = await fetch("/")
    const [data] = await parseResponse(response)

    expect(data).toEqual({ foo: "bar" })
  })

  it("returns a blob when the content type is not set to JSON", async () => {
    fetch.mockResponseOnce(JSON.stringify({ foo: "bar" }))

    const response = await fetch("/")
    const [data] = await parseResponse(response)

    // NOTE: There is some polyfilling going on so we cannot use `instanceof Blob`.
    expect(data.constructor.name).toBe("Blob")
  })
})
