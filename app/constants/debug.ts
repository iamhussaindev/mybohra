import Config from "app/config"

export const REMINDER_DEBUG_MODE =
  (__DEV__ && Config.DEBUG_REMINDER_NOTIFICATIONS !== false) ||
  Config.DEBUG_REMINDER_NOTIFICATIONS === true

export const REMINDER_DEBUG_TEST_DELAY_SECONDS = 30


