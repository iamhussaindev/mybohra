import { loadString, saveString } from "./storage"

const fetchSavedLocations = async () => {
  const latitude = await loadString("latitude", "0")
  const longitude = await loadString("longitude", "0")

  return {
    // TOOD: Remove the default values
    latitude: parseFloat(latitude ?? "0"),
    longitude: parseFloat(longitude ?? "0"),
  }
}

const saveLocation = async (latitude: string, longitude: string) => {
  await saveString("latitude", latitude)
  await saveString("longitude", longitude)
}

export { fetchSavedLocations, saveLocation }
