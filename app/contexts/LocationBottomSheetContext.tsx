import { useStores } from "app/models"
import { PlainLocation } from "app/types/location"
import React, { createContext, useContext, useRef, ReactNode } from "react"

import {
  LocationBottomSheet,
  LocationBottomSheetRef,
} from "../screens/Home/components/LocationBottomSheet"

interface LocationBottomSheetContextType {
  openLocationBottomSheet: () => void
  closeLocationBottomSheet: () => void
}

const LocationBottomSheetContext = createContext<LocationBottomSheetContextType | null>(null)

interface LocationBottomSheetProviderProps {
  children: ReactNode
}

export function LocationBottomSheetProvider({ children }: LocationBottomSheetProviderProps) {
  const locationBottomSheetRef = useRef<LocationBottomSheetRef>(null)
  const { dataStore } = useStores()

  const openLocationBottomSheet = () => {
    locationBottomSheetRef.current?.open()
  }

  const closeLocationBottomSheet = () => {
    locationBottomSheetRef.current?.close()
  }

  const handleLocationSelect = async (location: PlainLocation, isPersistent = false) => {
    if (isPersistent) {
      await dataStore.setCurrentLocation(location, true)
    } else {
      // When user manually selects a location, set it as persistent
      dataStore.setTemporaryLocation(location)
      dataStore.setPersistentMode(true) // Auto-enable persistent mode for manual selections
    }
    closeLocationBottomSheet()
  }

  return (
    <LocationBottomSheetContext.Provider
      value={{
        openLocationBottomSheet,
        closeLocationBottomSheet,
      }}
    >
      {children}
      <LocationBottomSheet ref={locationBottomSheetRef} onLocationSelect={handleLocationSelect} />
    </LocationBottomSheetContext.Provider>
  )
}

export function useLocationBottomSheet() {
  const context = useContext(LocationBottomSheetContext)
  if (!context) {
    throw new Error("useLocationBottomSheet must be used within a LocationBottomSheetProvider")
  }
  return context
}
