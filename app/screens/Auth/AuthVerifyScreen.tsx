import { Button, Screen, Text, TextField } from "app/components"
import Header from "app/components/Header"
import { supabase } from "app/services/supabase"
import { AppStackScreenProps } from "app/navigators"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React, { FC, useState } from "react"
import { Alert, View, ViewStyle } from "react-native"

type Props = AppStackScreenProps<"AuthVerify">

export const AuthVerifyScreen: FC<Props> = observer(function AuthVerifyScreen({
  navigation,
  route,
}) {
  const colors = useColors()
  const { email } = route.params
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  const onVerify = async () => {
    const token = code.trim().replace(/\s/g, "")
    if (token.length < 6) {
      Alert.alert("Code", "Enter the 6-digit code from your email.")
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      })
      if (error) {
        Alert.alert("Verification", error.message)
        return
      }
      navigation.pop(2)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={colors.background}>
      <Header title="Enter code" showBackButton />
      <View style={$body}>
        <Text preset="formLabel" color={colors.textDim} text={`Code sent to ${email}`} />
        <TextField
          label="6-digit code"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={12}
          containerStyle={$field}
        />
        <Button text="Verify" preset="filled" onPress={onVerify} disabled={loading} />
      </View>
    </Screen>
  )
})

const $body: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  gap: spacing.md,
}

const $field: ViewStyle = {
  marginBottom: spacing.sm,
}
