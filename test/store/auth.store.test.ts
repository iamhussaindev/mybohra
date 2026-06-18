import { act, renderHook } from "@testing-library/react-hooks"

import { useAuthStore } from "app/store/auth.store"

jest.mock("app/services/supabase/auth.service", () => ({
  getSession: jest.fn().mockResolvedValue(null),
  onAuthStateChange: jest.fn(() => jest.fn()),
  signInWithOtp: jest.fn(),
  signOut: jest.fn(),
  verifyOtp: jest.fn(),
}))

const authService = jest.requireMock("app/services/supabase/auth.service")

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
      error: null,
    })
    jest.clearAllMocks()
  })

  it("should sign out and clear session", async () => {
    authService.signOut.mockResolvedValue({ error: null })
    useAuthStore.setState({
      user: { id: "u1" } as never,
      session: { access_token: "t" } as never,
    })

    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      await result.current.signOut()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })

  it("should surface OTP send errors", async () => {
    authService.signInWithOtp.mockResolvedValue({ error: "Invalid email" })

    const { result } = renderHook(() => useAuthStore())

    let ok = false
    await act(async () => {
      ok = await result.current.sendOtp("bad")
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBe("Invalid email")
  })
})
