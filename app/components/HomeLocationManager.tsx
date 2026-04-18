import { HomeLocationModal } from "app/components/HomeLocationModal"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"

/**
 * Component that manages showing the home location confirmation modal
 * Shows when location is detected but home location is not set
 */
export const HomeLocationManager = observer(function HomeLocationManager() {
  const { dataStore } = useStores()
  const [showModal, setShowModal] = useState(false)

  // Load home location on mount
  useEffect(() => {
    const loadHomeLocation = async () => {
      await dataStore.loadHomeLocation()
    }
    loadHomeLocation()
  }, [dataStore])

  // Show modal when location is loaded but home location is not set
  useEffect(() => {
    if (
      dataStore.currentLocationLoaded &&
      !dataStore.homeLocationLoaded &&
      dataStore.currentLocation.city && // Ensure we have a valid location
      dataStore.currentLocation.city !== "" // Not empty
    ) {
      // Small delay to avoid showing immediately on app start
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [
    dataStore.currentLocationLoaded,
    dataStore.homeLocationLoaded,
    dataStore.currentLocation.city,
  ])

  const handleConfirm = async () => {
    await dataStore.setHomeLocation(dataStore.currentLocation)
    setShowModal(false)
  }

  const handleCancel = () => {
    setShowModal(false)
    // Don't show again until app restart or location changes significantly
  }

  if (!showModal || !dataStore.currentLocationLoaded) {
    return null
  }

  return (
    <HomeLocationModal
      visible={showModal}
      location={{
        city: dataStore.currentLocation.city,
        state: dataStore.currentLocation.state,
        country: dataStore.currentLocation.country,
      }}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )
})

