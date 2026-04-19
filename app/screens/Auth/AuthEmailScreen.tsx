import { Button, Screen, Text, TextField } from "app/components"
import Header from "app/components/Header"
import { supabase } from "app/services/supabase"
import { AppStackScreenProps } from "app/navigators"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React, { FC, useState } from "react"
import { Alert, View, ViewStyle } from "react-native"

type Props = AppStackScreenProps<"AuthEmail">

export const AuthEmailScreen: FC<Props> = observer(function AuthEmailScreen({ navigation, route }) {
  const colors = useColors()
  const redirectTo = route.params?.redirectTo
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const onContinue = async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed.includes("@")) {
      Alert.alert("Check email", "Enter a valid email address.")
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { shouldCreateUser: true },
      })
      if (error) {
        Alert.alert("Sign in", error.message)
        return
      }
      navigation.navigate("AuthVerify", { email: trimmed, redirectTo })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={colors.background}>
      <Header title="Sign in" showBackButton />
      <View style={$body}>
        <Text
          preset="formLabel"
          color={colors.textDim}
          text="We will email you a one-time code to create or access your RSVP."
          style={$intro}
        />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          containerStyle={$field}
        />
        <Button text="Send code" preset="filled" onPress={onContinue} disabled={loading} />
      </View>
    </Screen>
  )
})

const $body: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  gap: spacing.md,
}

const $intro: ViewStyle = {
  marginBottom: spacing.sm,
}

const $field: ViewStyle = {
  marginBottom: spacing.sm,
}
