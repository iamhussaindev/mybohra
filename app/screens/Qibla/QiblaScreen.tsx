import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import sensors from "react-native-sensors"
import haversine from "haversine"
import { useStores } from "app/models"

const QiblaDirectionScreen = () => {
  const [location, setLocation] = useState(null)
  const [magnetometer, setMagnetometer] = useState(null)
  const [qiblaDirection, setQiblaDirection] = useState(null)
  const { dataStore } = useStores()

  useEffect(() => {
    const subscription = sensors
      .magnetometer({
        updateInterval: 100,
      })
      .subscribe(
        (data) => setMagnetometer(data),
        (error) => console.log(error),
      )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (location && magnetometer) {
      calculateQiblaDirection()
    }
  }, [location, magnetometer])

  const calculateQiblaDirection = () => {
    const { latitude, longitude } = dataStore.currentLocation
    const kaaba = { latitude: 21.4225, longitude: 39.8262 } // Coordinates of the Kaaba in Mecca

    const bearing = haversine({ latitude, longitude }, kaaba, {
      unit: "degree",
      threshold: 0,
      longitudeToLatitudeRatio: 1,
    })

    setQiblaDirection(bearing)
  }

  return (
    <View style={styles.container}>
      {location && magnetometer ? (
        <Text style={styles.text}>Qibla Direction: {qiblaDirection}°</Text>
      ) : (
        <Text style={styles.text}>Fetching Qibla Direction...</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
})

export default QiblaDirectionScreen
