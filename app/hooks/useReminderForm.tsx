import { NamazTimes, namazLabels } from "app/helpers/namaz.helper"
import { useState, useCallback } from "react"

export interface ReminderFormData {
  name: string
  prayerTime: keyof NamazTimes
  offsetMinutes: number
  repeatType: "daily" | "weekly" | "monthly" | "never"
  customDays: number[]
}

const initialFormData: ReminderFormData = {
  name: "",
  prayerTime: "fajr",
  offsetMinutes: 0,
  repeatType: "daily",
  customDays: [],
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function useReminderForm(initialData?: Partial<ReminderFormData>) {
  const [formData, setFormData] = useState<ReminderFormData>({
    ...initialFormData,
    ...initialData,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ReminderFormData, string>>>({})

  const updateField = useCallback(
    (field: keyof ReminderFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    },
    [errors],
  )

  const updatePrayerTime = useCallback((prayerTime: keyof NamazTimes) => {
    setFormData((prev) => ({
      ...prev,
      prayerTime,
      name: prev.name || `${namazLabels[prayerTime]} Reminder`,
    }))
  }, [])

  const updateOffset = useCallback((offsetMinutes: number) => {
    setFormData((prev) => ({ ...prev, offsetMinutes }))
  }, [])

  const updateRepeatType = useCallback((repeatType: "daily" | "weekly" | "monthly" | "never") => {
    setFormData((prev) => ({
      ...prev,
      repeatType,
      customDays: repeatType === "weekly" ? prev.customDays : [],
    }))
  }, [])

  const toggleCustomDay = useCallback((dayIndex: number) => {
    setFormData((prev) => {
      const newCustomDays = prev.customDays.includes(dayIndex)
        ? prev.customDays.filter((day) => day !== dayIndex)
        : [...prev.customDays, dayIndex].sort()

      return { ...prev, customDays: newCustomDays }
    })
  }, [])

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof ReminderFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Reminder name is required"
    }

    if (formData.repeatType === "weekly" && formData.customDays.length === 0) {
      newErrors.customDays = "Please select at least one day for weekly repeat"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setErrors({})
  }, [])

  const getOffsetDescription = useCallback((offsetMinutes: number): string => {
    if (offsetMinutes === 0) return "At prayer time"
    if (offsetMinutes > 0) return `${offsetMinutes} minutes after`
    return `${Math.abs(offsetMinutes)} minutes before`
  }, [])

  const getRepeatDescription = useCallback((repeatType: string, customDays: number[]): string => {
    switch (repeatType) {
      case "daily":
        return "Every day"
      case "weekly":
        if (customDays.length === 0) return "Weekly"
        if (customDays.length === 7) return "Every day"
        return customDays.map((day) => dayNames[day]).join(", ")
      case "monthly":
        return "Monthly"
      case "never":
        return "Once only"
      default:
        return "Unknown"
    }
  }, [])

  return {
    formData,
    errors,
    updateField,
    updatePrayerTime,
    updateOffset,
    updateRepeatType,
    toggleCustomDay,
    validateForm,
    resetForm,
    getOffsetDescription,
    getRepeatDescription,
    dayNames,
  }
}
