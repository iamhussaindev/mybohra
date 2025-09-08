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

  const openLocationBottomSheet = () => {
    locationBottomSheetRef.current?.open()
  }

  const closeLocationBottomSheet = () => {
    locationBottomSheetRef.current?.close()
  }

  const handleLocationSelect = (location: any) => {
    console.log("Selected location:", location)
    // Here you can update the current location in the dataStore
    // dataStore.setCurrentLocation(location)
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
