import { create } from "zustand"

interface UserPreferences {
  notificationsEnabled: boolean
  prayerRemindersEnabled: boolean
  preferredLanguage: string
}

interface UserState {
  preferences: UserPreferences
  displayName: string | null

  setDisplayName: (name: string | null) => void
  updatePreferences: (patch: Partial<UserPreferences>) => void
}

const defaultPreferences: UserPreferences = {
  notificationsEnabled: true,
  prayerRemindersEnabled: true,
  preferredLanguage: "en",
}

export const useUserStore = create<UserState>((set) => ({
  preferences: defaultPreferences,
  displayName: null,

  setDisplayName: (name) => set({ displayName: name }),
  updatePreferences: (patch) =>
    set((state) => ({
      preferences: { ...state.preferences, ...patch },
    })),
}))
