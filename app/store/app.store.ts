import { create } from "zustand"

interface AppState {
  isGlobalLoading: boolean
  globalError: string | null
  activeModal: string | null

  setGlobalLoading: (loading: boolean) => void
  setGlobalError: (error: string | null) => void
  showModal: (modalId: string) => void
  hideModal: () => void
}

export const useAppStore = create<AppState>((set) => ({
  isGlobalLoading: false,
  globalError: null,
  activeModal: null,

  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),
  setGlobalError: (error) => set({ globalError: error }),
  showModal: (modalId) => set({ activeModal: modalId }),
  hideModal: () => set({ activeModal: null }),
}))
