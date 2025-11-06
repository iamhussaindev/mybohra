# MyBohra App - Screens and Features

## 📱 Home Screen

- Display current sound player - DONE
- Hero icons navigation (Calendar, Home, Namaz) - DONE
- Ramazan Niyyat display
- Namaz times display - DONE
- Next prayer time indicator
- Grid icons navigation
- Current Qiyam display - DONE
- Bookmark & pinned items section
- Daily duas section
- Miqaats today section
- Upcoming miqaats section
- Pull-to-refresh functionality
- Location display in header - DONE

## 📅 Calendar Screen

- Hijri calendar view
- Gregorian date display
- Month navigation (previous/next)
- Week view layout
- Day selection
- Selected date highlighting
- Miqaats list for selected date
- Empty state when no miqaats
- Hijri to Gregorian date conversion display
- Sticky section headers
- Weekly calendar grid

## 🕌 Namaz Screen

- Location display with edit button
- Prayer times list grouped by:
  - Morning: Sihori End, Fajr, Fajr End
  - Noon: Zawaal, Zohr End, Asr End
  - Evening: Maghrib, Nisful Layl, Nisful Layl End
- Individual prayer time toggle switches
- Quick reminder enable/disable per prayer
- Reminder bell icons
- Current ghari highlighting
- Next namaz indicator
- Long press for custom offset selection
- Settings button navigation
- Bottom sheet for offset selection
- Disabled reminder button for non-alarm times
- Active group background highlight

## 🔢 Counter Screen (Tasbeeh)

- Drag-and-drop counter positioning
- Counter persistence across sessions
- Goal selector bottom sheet
- Goal values: 20, 33, 40, 53, 100, 200, 500, 1000, 10000
- Progress circle visualization
- Counter increment on tap
- Counter decrement button
- Long press continuous decrement
- Reset confirmation alert
- Tasbeeh selector bottom sheet
- Search in tasbeeh selector
- Grouped tasbeeh list (DEENI, MISC, OTHER)
- Arabic text display with dynamic font sizing
- Image tasbeeh display
- Full-screen image mode for goal -1
- Counter hide when goal is -1
- Haptic feedback on press
- Counter position save/load
- Selected tasbeeh name in header
- Close/reset button in header

## 📿 Tasbeeh List Screen

- Search functionality with animation
- Animated search field
- Keyboard dismissal
- Grouped display (DEENI, OTHER)
- Grid layout for DEENI items
- Single column for OTHER items
- Arabic text display for DEENI
- Day name display (Sunday-Saturday)
- Navigation to Counter screen on selection
- Search with Fuse.js fuzzy matching
- Auto-close search on item selection
- Header with search icon
- Icon press animation

## 📖 Dua List Screen

- Search functionality with animation
- Current sound player display
- Daily duas & bookmarks section
- PDF library display
- Long press for PDF options
- PDF options bottom sheet:
  - Pin to home screen
  - Open PDF
  - Report PDF
- Pin/unpin functionality
- Alert confirmation for pin/unpin
- Haptic feedback on actions
- Search field animation
- Keyboard handling

## 📄 PDF Screen

- PDF viewer with react-native-pdf
- Full-screen toggle on tap
- Audio player integration
- Play/pause button
- Seek slider
- Position display (current/total)
- Speed control (1.5x)
- 10-second backward skip
- 10-second forward skip
- Stop button
- Buffering indicator
- Audio controls visibility based on state
- Page navigation for multi-page PDFs
- Annotation rendering
- Antialiasing enabled
- Loading state
- Single page mode toggle
- Header with fullscreen animation

## 🔔 Reminder Screen

- List of all reminders
- Add reminder button
- Empty state with CTA
- Reminder item cards
- Edit reminder functionality
- Reminder form modal
- Loading state
- Enabled/disabled reminder display

## ⚙️ Reminder Settings Screen

- Notification type selector:
  - Azan (long)
  - Alert (short)
- Trigger time selector:
  - 5, 10, 15, 20, 25, 30, 45, 60 minutes before
- Bottom sheet selectors
- Settings persistence
- Icon-based UI

## 🎯 Event Reminder Screen

- Date display (Hijri + Gregorian)
- Event title input (required)
- Description text area (optional)
- Reminder time input (required)
- Repeat toggle switch
- Repeat type dropdown:
  - Hijri date repeat
  - Gregorian date repeat
- Form validation
- Save/Cancel buttons
- Loading state
- Success/error alerts

## 🧭 Qibla Screen

- Qibla direction calculation
- Magnetometer sensor integration
- Location-based bearing calculation
- Kaaba coordinates (21.4225, 39.8262)
- Real-time direction updates
- Loading state while fetching

## 📋 Saved Tasbeeh Screen

- Saved tasbeeh list display
- Count display per saved item
- Empty state (basic implementation)

## 🔍 Search Screen

- Placeholder screen
- Basic text display

## 👤 Account Screen

- Placeholder screen
- Basic text display

## 🛒 Market Screen

- Placeholder screen
- Basic text display

## ⚠️ Error Screen

- Error boundary component
- Error details display
- Error message rendering

## 🚀 Loader Screen

- Full-screen loader component
- Loading indicator

## Navigation Features

- Bottom tab navigation:
  - Home tab
  - Search tab
  - Market tab
  - Account tab
- Stack navigation for detailed screens
- Back button handling
- Deep linking support

## 🎨 Global Features

- RTL (Right-to-Left) language support
- Multi-language support (Arabic, English, French, Korean)
- Dark mode support (theme-based)
- Safe area handling
- Pull-to-refresh on multiple screens
- Bottom sheet drawers
- Haptic feedback
- Location bottom sheet context
- Sound player integration
- Firebase analytics
- Offline support
- AsyncStorage persistence
