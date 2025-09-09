// Type for plain location objects (to avoid MST "dead object" errors)
export type PlainLocation = {
  latitude: number
  longitude: number
  city: string
  country: string
  state: string | null
  timezone: string
  type: string
}
