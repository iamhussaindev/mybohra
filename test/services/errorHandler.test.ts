import { handleSupabaseError } from "app/services/api/errorHandler"

describe("handleSupabaseError", () => {
  it("maps offline errors", () => {
    expect(handleSupabaseError({ message: "Network request failed" })).toContain("offline")
  })

  it("maps 401", () => {
    expect(handleSupabaseError({ message: "JWT", status: 401 })).toContain("Session expired")
  })

  it("maps 500", () => {
    expect(handleSupabaseError({ message: "error", status: 500 })).toContain("Server error")
  })
})
