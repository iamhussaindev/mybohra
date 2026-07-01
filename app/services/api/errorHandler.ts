export function handleSupabaseError(error: {
  message?: string
  status?: number
} | null): string {
  if (!error) return "Unknown error"

  const message = error.message ?? ""

  if (message.toLowerCase().includes("offline") || message.toLowerCase().includes("network")) {
    return "No internet connection. Using offline data."
  }
  if (error.status === 401) {
    return "Session expired. Please log in again."
  }
  if (error.status === 403) {
    return "You do not have permission for this action."
  }
  if (error.status === 404) {
    return "Resource not found."
  }
  if (error.status != null && error.status >= 500) {
    return "Server error. Please try again later."
  }

  return message || "An error occurred"
}
