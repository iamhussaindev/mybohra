import { useNavigation } from "@react-navigation/native"
import { useEffect } from "react"

export function AccountScreen() {
  const navigation = useNavigation()

  useEffect(() => {
    // Redirect to Settings screen
    // @ts-ignore
    // navigation.navigate("Settings")
  }, [navigation])

  return null
}
