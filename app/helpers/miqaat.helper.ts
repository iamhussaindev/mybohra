import { IMiqaat } from "app/models/MiqaatStore"

export function setupTitle(miqaat: IMiqaat) {
  if (miqaat.isNight && miqaat.type === "URS") {
    return `Urs ni Raat ${miqaat.name.replace("Urs Mubarak, ", "")}`
  }

  if (miqaat.isNight && miqaat.type === "SHAHADAT") {
    return `Shahadat ni Raat ${miqaat.name.replace("Shahadat ", "")}`
  }

  return miqaat.name
}
