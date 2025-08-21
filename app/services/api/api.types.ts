/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */

import { IMiqaat } from "app/models/MiqaatStore"

export interface ApiMiqaatResponse {
  miqaats: IMiqaat[]
}

export interface ApiDataResponse {
  key: string
  value: string
  updatedAt: string
  createdAt: string
}

// location response
// "id": 1500,
// "latitude": 24.489648,
// "longitude": 118.138046,
// "city": "Xiamen",
// "country": "China",
// "distance": 937448.0289964577

export interface ApiLocationResponse {
  id: number
  latitude: number
  longitude: number
  city: string
  country: string
  state: string
  timezone: string
  distance: number
}

export interface Metadata {
  pdfSize?: number
  audioSize?: number
  thumbnail?: string
  audioDuration?: number
  pdfPageCount?: number
}

export interface ApiLibraryResonse {
  categories: string[]
  id: number
  name: string
  audio?: string
  pdf?: string
  metadata?: Metadata
}

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}
