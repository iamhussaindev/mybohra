export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: number }

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

export function fail(error: string, code = 400): ApiResponse<never> {
  return { success: false, error, code }
}
