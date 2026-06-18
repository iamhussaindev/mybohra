import type { GeneralApiProblem } from "app/services/api/apiProblem"

type OkResponse<T> = { kind: "ok"; data: T }

export function unwrapApiResponse<T>(response: OkResponse<T> | GeneralApiProblem): T {
  if (response.kind !== "ok") {
    throw new Error(`API error: ${response.kind}`)
  }
  return response.data
}
