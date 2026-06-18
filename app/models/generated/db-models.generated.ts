/**
 * AUTO-GENERATED — DO NOT EDIT
 *
 * Source of truth: mybohra-dashboard/supabase/migrations/
 * Regenerate: cd mybohra-dashboard && npm run db:sync
 *
 * Generated: 2026-06-18T16:18:57.318Z
 */

import { types, Instance } from 'mobx-state-tree'
import type { Database } from 'app/services/supabase/types'

export const LibraryDbModel = types.model('LibraryDbModel', {
  album: types.maybeNull(types.enumeration("Album", ["MADEH", "NOHA", "SALAAM", "ILTEJA", "QURAN", "DUA", "MUNAJAAT", "MANQABAT", "NAAT", "RASA", "QASIDA", "NASIHAT"])),
  audio_url: types.maybeNull(types.string),
  categories: types.maybeNull(types.array(types.string)),
  created_at: types.string,
  description: types.maybeNull(types.string),
  id: types.identifierNumber,
  metadata: types.maybeNull(types.frozen()),
  name: types.string,
  pdf_url: types.maybeNull(types.string),
  pdf_view_count: types.maybeNull(types.number),
  search_text: types.maybeNull(types.string),
  search_vector: types.frozen(),
  tags: types.maybeNull(types.array(types.string)),
  updated_at: types.string,
  view_count: types.maybeNull(types.number),
  youtube_id: types.maybeNull(types.number),
  youtube_url: types.maybeNull(types.string),
})
export type ILibraryDb = Instance<typeof LibraryDbModel>

export const MiqaatDbModel = types.model('MiqaatDbModel', {
  created_at: types.string,
  date: types.maybeNull(types.number),
  date_night: types.maybeNull(types.number),
  description: types.maybeNull(types.string),
  html: types.maybeNull(types.string),
  id: types.identifierNumber,
  image: types.maybeNull(types.string),
  important: types.maybeNull(types.boolean),
  location: types.maybeNull(types.string),
  month: types.maybeNull(types.number),
  month_night: types.maybeNull(types.number),
  name: types.string,
  phase: types.enumeration("Phase", ["DAY", "NIGHT"]),
  priority: types.maybeNull(types.number),
  type: types.maybeNull(types.enumeration("MiqaatType", ["URS", "MILAD", "WASHEQ", "PEHLI_RAAT", "SHAHADAT", "ASHARA", "IMPORTANT_NIGHT", "EID", "OTHER"])),
  updated_at: types.string,
})
export type IMiqaatDb = Instance<typeof MiqaatDbModel>

export const TasbeehDbModel = types.model('TasbeehDbModel', {
  arabic_text: types.maybeNull(types.string),
  audio: types.maybeNull(types.string),
  count: types.maybeNull(types.number),
  created_at: types.string,
  description: types.maybeNull(types.string),
  id: types.identifierNumber,
  image: types.maybeNull(types.string),
  name: types.string,
  tags: types.maybeNull(types.array(types.string)),
  text: types.maybeNull(types.string),
  type: types.enumeration("TasbeehType", ["MISC", "DEENI", "OTHER"]),
  updated_at: types.string,
})
export type ITasbeehDb = Instance<typeof TasbeehDbModel>

export const YouTubeVideoDbModel = types.model('YouTubeVideoDbModel', {
  categories: types.maybeNull(types.array(types.string)),
  channel_handle: types.maybeNull(types.string),
  channel_url: types.maybeNull(types.string),
  created_at: types.string,
  description: types.maybeNull(types.string),
  duration: types.maybeNull(types.number),
  id: types.identifierNumber,
  library_id: types.maybeNull(types.number),
  tags: types.maybeNull(types.array(types.string)),
  thumbnail: types.maybeNull(types.string),
  thumbnail_default: types.maybeNull(types.string),
  thumbnail_high: types.maybeNull(types.string),
  thumbnail_maxres: types.maybeNull(types.string),
  thumbnail_medium: types.maybeNull(types.string),
  thumbnail_standard: types.maybeNull(types.string),
  title: types.string,
  updated_at: types.string,
  upload_date: types.maybeNull(types.string),
  url: types.string,
  video_id: types.string,
  view_count: types.maybeNull(types.number),
})
export type IYouTubeVideoDb = Instance<typeof YouTubeVideoDbModel>

export const DataDbModel = types.model('DataDbModel', {
  created_at: types.string,
  id: types.identifierNumber,
  key: types.string,
  updated_at: types.string,
  value: types.maybeNull(types.string),
})
export type IDataDb = Instance<typeof DataDbModel>

export const LocationDbModel = types.model('LocationDbModel', {
  city: types.string,
  country: types.string,
  created_at: types.string,
  id: types.identifierNumber,
  latitude: types.number,
  longitude: types.number,
  state: types.maybeNull(types.string),
  timezone: types.string,
  type: types.string,
  updated_at: types.string,
})
export type ILocationDb = Instance<typeof LocationDbModel>

export const DailyDuasDbModel = types.model('DailyDuasDbModel', {
  created_at: types.string,
  date: types.number,
  id: types.identifierNumber,
  library_id: types.number,
  month: types.number,
  note: types.maybeNull(types.string),
  updated_at: types.string,
})
export type IDailyDuasDb = Instance<typeof DailyDuasDbModel>

export const ZiyaratDbModel = types.model('ZiyaratDbModel', {
  address: types.maybeNull(types.string),
  city: types.maybeNull(types.string),
  created_at: types.maybeNull(types.string),
  created_by: types.maybeNull(types.string),
  history: types.maybeNull(types.string),
  id: types.identifier,
  lat: types.maybeNull(types.number),
  lng: types.maybeNull(types.number),
  name: types.string,
  photos: types.maybeNull(types.array(types.string)),
  rank: types.maybeNull(types.enumeration("DaiRank", ["HUDUD_FOZALA", "HINDUSTAN_DUAT_MUTLAQEEN", "YEMEN_DUAT_MUTLAQEEN", "ATABAAT_AALIYAH"])),
  updated_at: types.maybeNull(types.string),
  updated_by: types.maybeNull(types.string),
  year: types.maybeNull(types.number),
})
export type IZiyaratDb = Instance<typeof ZiyaratDbModel>

export const MusafirkhanaDbModel = types.model('MusafirkhanaDbModel', {
  address: types.maybeNull(types.string),
  city: types.maybeNull(types.string),
  contact_person_name: types.maybeNull(types.string),
  created_at: types.maybeNull(types.string),
  created_by: types.maybeNull(types.string),
  description: types.maybeNull(types.string),
  email: types.maybeNull(types.string),
  id: types.identifier,
  info: types.maybeNull(types.string),
  lat: types.maybeNull(types.number),
  lng: types.maybeNull(types.number),
  map_link: types.maybeNull(types.string),
  name: types.string,
  phone: types.maybeNull(types.string),
  photos: types.maybeNull(types.array(types.string)),
  total_rooms: types.maybeNull(types.number),
  updated_at: types.maybeNull(types.string),
  updated_by: types.maybeNull(types.string),
})
export type IMusafirkhanaDb = Instance<typeof MusafirkhanaDbModel>

export const MasjidDbModel = types.model('MasjidDbModel', {
  created_at: types.maybeNull(types.string),
  created_by: types.maybeNull(types.string),
  id: types.identifier,
  location_id: types.maybeNull(types.number),
  map_link: types.maybeNull(types.string),
  mazaar_id: types.maybeNull(types.string),
  name: types.string,
  photos: types.maybeNull(types.array(types.string)),
  updated_at: types.maybeNull(types.string),
  updated_by: types.maybeNull(types.string),
})
export type IMasjidDb = Instance<typeof MasjidDbModel>

export const NearbyPlaceDbModel = types.model('NearbyPlaceDbModel', {
  created_at: types.maybeNull(types.string),
  created_by: types.maybeNull(types.string),
  description: types.maybeNull(types.string),
  id: types.identifier,
  lat: types.maybeNull(types.number),
  lng: types.maybeNull(types.number),
  mazaar_id: types.string,
  name: types.string,
  photos: types.maybeNull(types.array(types.string)),
  type: types.string,
  updated_at: types.maybeNull(types.string),
  updated_by: types.maybeNull(types.string),
})
export type INearbyPlaceDb = Instance<typeof NearbyPlaceDbModel>

export const MazaarDbModel = types.model('MazaarDbModel', {
  contact: types.maybeNull(types.string),
  created_at: types.maybeNull(types.string),
  created_by: types.maybeNull(types.string),
  id: types.identifier,
  lat: types.maybeNull(types.number),
  lng: types.maybeNull(types.number),
  location_id: types.maybeNull(types.number),
  name: types.string,
  photos: types.maybeNull(types.array(types.string)),
  social_media: types.maybeNull(types.array(types.string)),
  updated_at: types.maybeNull(types.string),
  updated_by: types.maybeNull(types.string),
  website: types.maybeNull(types.string),
})
export type IMazaarDb = Instance<typeof MazaarDbModel>

export const DeviceDbModel = types.model('DeviceDbModel', {
  app_version: types.maybeNull(types.string),
  created_at: types.maybeNull(types.string),
  current_lat: types.maybeNull(types.number),
  current_lng: types.maybeNull(types.number),
  device_id: types.string,
  device_ip: types.frozen(),
  id: types.identifier,
  last_seen_at: types.maybeNull(types.string),
  location_updated_at: types.maybeNull(types.string),
  manufacturer: types.maybeNull(types.string),
  metadata: types.maybeNull(types.frozen()),
  model: types.maybeNull(types.string),
  os_version: types.maybeNull(types.string),
  platform: types.maybeNull(types.string),
  platform_version: types.maybeNull(types.string),
  updated_at: types.maybeNull(types.string),
  user_agent: types.maybeNull(types.string),
  user_id: types.maybeNull(types.string),
})
export type IDeviceDb = Instance<typeof DeviceDbModel>

export const RsvpEventDbModel = types.model('RsvpEventDbModel', {
  closed_at: types.maybeNull(types.string),
  created_at: types.string,
  created_by: types.maybeNull(types.string),
  creator_device_id: types.maybeNull(types.string),
  event_type: types.enumeration("RsvpEventType", ["miqaat", "darees", "majlis", "shadi", "birthday"]),
  host_label: types.string,
  host_mode: types.enumeration("RsvpHostMode", ["jamaat", "individual"]),
  id: types.identifier,
  linked_miqaat_id: types.maybeNull(types.number),
  message: types.maybeNull(types.string),
  scheduled_at: types.string,
  slug: types.string,
  title: types.maybeNull(types.string),
  updated_at: types.string,
})
export type IRsvpEventDb = Instance<typeof RsvpEventDbModel>

export const RsvpResponseDbModel = types.model('RsvpResponseDbModel', {
  created_at: types.string,
  event_id: types.string,
  guest_name: types.maybeNull(types.string),
  headcount: types.number,
  id: types.identifier,
  responder_user_id: types.maybeNull(types.string),
  status: types.enumeration("RsvpResponseStatus", ["yes", "no", "maybe"]),
})
export type IRsvpResponseDb = Instance<typeof RsvpResponseDbModel>
