# Chunked Golf App - Complete Implementation Plan

## Overview
This document outlines the complete transformation of the Chunked golf app into a polished, professional product with brand-consistent design and enhanced functionality.

---

## ✅ COMPLETED

### 1. Updated Golf Constants
- ✅ Added "Hybrid", "7 Wood", "Gap Wedge", "Approach Wedge" to CLUBS array
- ✅ Added "pure", "decent", "horrible" to SHOT_QUALITIES
- ✅ Created SHOT_QUALITY_DESCRIPTORS with 0-10 scale
  - 0: "Disgusting" 💀
  - 1: "Awful" 😱
  - 2: "Terrible" 😤
  - 3: "Bad" 😬
  - 4: "Below Average" 😕
  - 5: "Average" 😐
  - 6: "Decent" 🙂
  - 7: "Good" 😊
  - 8: "Great" 😄
  - 9: "Excellent" 🔥
  - 10: "Cracked" ⛳

### 2. Theme Updates
- ✅ Added brand colors to ThemeContext:
  - `brandTealDark`: #008080 (deep teal)
  - `brandTealMid`: #20A0A0
  - `brandTealLight`: #40E0D0 (turquoise)
  - `brandGreen`: #30D5B8
  - `brandWhite`: #FFFFFF
- ✅ Updated primary colors to use brand teal

### 3. Custom Modal Component
- ✅ Created `ThemedModal.jsx` with:
  - Teal-green gradient buttons
  - Glass morphism styling
  - Blur backdrop
  - Haptic feedback
  - Support for multiple button styles (default, cancel, destructive)

---

## 🚧 IN PROGRESS

### Feature 1: Shot Quality Slider + Enhanced Club Selection

#### Files to Modify:
1. `/apps/mobile/src/app/round-logger.jsx`

#### Changes Needed:
- [ ] Add React Native Slider import (`@react-native-community/slider`)
- [ ] Replace club button grid with Picker/Dropdown component
- [ ] Add shot quality slider (0-10) with live feedback
- [ ] Update shot data model to include `qualityRating: number`
- [ ] Display selected descriptor label and emoji above slider
- [ ] Keep existing quality checkboxes (pure, decent, chunk, etc.) as optional tags
- [ ] Update `addShot()` to accept quality rating parameter

#### UI Layout:
```
Modal: Add Shot
├── Club Selection (Dropdown)
│   └── Shows all 18 clubs
├── Quality Rating Slider
│   ├── Label: "Shot Quality"
│   ├── Slider (0-10 with 11 stops)
│   ├── Live feedback: "😊 Good" (updates as you slide)
│   └── Gradient track (teal to green)
├── Shot Qualities (Optional Tags)
│   └── Checkboxes: pure, decent, chunk, slice, hook, etc.
├── Notes (Text Input)
└── Buttons
    ├── Cancel (glass style)
    └── Save Shot (gradient style)
```

---

### Feature 2: Hole-by-Hole Review Interface

#### Files to Create:
1. `/apps/mobile/src/app/hole-detail.jsx` (new screen)
2. `/apps/mobile/src/components/HoleReviewCard.jsx` (new component)

#### Files to Modify:
1. `/apps/mobile/src/app/round-logger.jsx` - Make holes tappable
2. `/apps/mobile/src/app/(tabs)/journal.jsx` - Make holes tappable in past rounds

#### Features:
- [ ] Tap any hole number to view detailed breakdown
- [ ] Show all shots for that hole with:
  - Shot number
  - Club used
  - Quality rating (0-10 with emoji)
  - Quality tags (if any)
  - Notes
- [ ] Show hole summary:
  - Total shots
  - Par
  - Score vs par (Eagle/Birdie/Par/Bogey/etc.)
  - AI-generated summary based on shots
- [ ] Smooth slide-in animation (bottom sheet style)
- [ ] Swipe to dismiss gesture
- [ ] Navigation arrows to move between holes

#### UI Design:
```
┌─────────────────────────────┐
│ ← Hole 7          Par 4 →  │ (gradient header)
├─────────────────────────────┤
│ Your Score: 5 (+1)          │
│ 😕 Bogey                    │
├─────────────────────────────┤
│ Shot 1 ⛳                    │
│ Driver                      │
│ 🔥 Excellent (9/10)         │
│ Tags: pure                  │
│ "Perfect drive down middle" │
├─────────────────────────────┤
│ Shot 2 📍                    │
│ 7 Iron                      │
│ 😕 Below Average (4/10)     │
│ Tags: thin                  │
│ "Came up short of green"    │
├─────────────────────────────┤
│ ... (more shots)            │
└─────────────────────────────┘
```

---

### Feature 3: Themed Modals (Replace All Alerts)

#### Files to Modify:
1. `/apps/mobile/src/app/round-logger.jsx`
   - Replace `Alert.alert("Shot Logged", ...)` with `<ThemedModal>`
   - Replace `Alert.alert("Finish Round", ...)` with `<ThemedModal>`
   - Replace `Alert.alert("No Shots Logged", ...)` with `<ThemedModal>`

2. `/apps/mobile/src/app/(tabs)/new-round.jsx`
   - Replace any Alert calls with `<ThemedModal>`

3. `/apps/mobile/src/app/(tabs)/profile.jsx`
   - Replace data deletion confirmation with `<ThemedModal>`

4. `/apps/mobile/src/app/(tabs)/journal.jsx`
   - Replace round deletion confirmation with `<ThemedModal>`

#### Modal Types Needed:
- [x] **ThemedModal** - Generic modal (already created)
- [ ] **ShotLoggedModal** - Custom "Shot Logged" with branded colors
- [ ] **FinishRoundModal** - Custom "Finish Round" confirmation
- [ ] **DeleteConfirmModal** - Destructive action confirmation

---

### Feature 4: Golf Course API Integration

#### Research Completed:
The PGA of America doesn't have a public API. Options:
1. **Golf Genius API** ($$$ - requires business account)
2. **USGA Course Database** (limited, no API)
3. **18Birdies/GolfNow** (private APIs, no public access)
4. **Golf Course Guide API** (https://api.golfcourse.guide/) - **RECOMMENDED**
5. **RapidAPI Golf Courses** - Has course search with lat/lon
6. **Manual data scraping** - Legal grey area

#### Recommended Approach:
Use **RapidAPI Golf Course Data** API:
- URL: https://rapidapi.com/apininjas/api/golf-course-data
- Cost: Free tier (100 requests/day), then $0.001/request
- Covers: 30,000+ courses worldwide
- Data: Name, address, phone, website, holes, par

#### Implementation:
1. [ ] Sign up for RapidAPI account
2. [ ] Subscribe to Golf Course Data API (free tier)
3. [ ] Add API key to environment variables
4. [ ] Update `/apps/mobile/src/services/golfApi.js`:
   - Add RapidAPI integration
   - Implement course search by name/location
   - Implement course details fetch
   - Add caching layer (AsyncStorage) for frequently searched courses
5. [ ] Create 25+ manual course entries for demo (including Newton Commonwealth, Wayland CC)

#### Files to Modify:
- `/apps/mobile/src/services/golfApi.js`
- `/apps/mobile/src/app/(tabs)/new-round.jsx` (already uses golfApi)

---

### Feature 5: Fix All Unrealistic Numbers

#### Issues Found:
1. **Profile Stats** - Shows "-182" average score (impossible)
2. **Journal** - Shows "21 shots, 8 shots" (unrealistic)
3. **Sample Data** - Generated rounds don't reflect real golf scores

#### Files to Modify:
1. `/apps/mobile/src/contexts/RoundContext.jsx`
   - Update `createSampleRounds()` function
   - Generate realistic scores (70-130 range)
   - Match score descriptions to user's request:
     - 70 or lower: "You're basically on the tour"
     - 71-78: "Exceptional round"
     - 79-85: "Looking great"
     - 86-95: "Not bad"
     - 96-105: "Not bad, could be better"
     - 106-120: "You suck, but it's okay - golf is hard"
     - 121+: "Could be time to hang it up"

2. `/apps/mobile/src/app/(tabs)/profile.jsx`
   - Fix `calculateStats()` function
   - Show average score correctly (e.g., "92 (+20)")
   - Calculate proper average relative to par

3. `/apps/mobile/src/app/(tabs)/journal.jsx`
   - Update round summary to show realistic totals
   - Fix shot count display

#### Scoring Logic:
```javascript
// Correct way to calculate score
const getTotalShots = (round) => {
  return round.holes.reduce((total, hole) => total + hole.shots.length, 0);
};

const getTotalPar = (round) => {
  return round.holes.reduce((total, hole) => total + hole.par, 0);
};

const getScoreVsPar = (round) => {
  const totalShots = getTotalShots(round);
  const totalPar = getTotalPar(round);
  const difference = totalShots - totalPar;
  return {
    totalShots,
    totalPar,
    difference,
    formatted: difference >= 0 ? `+${difference}` : `${difference}`,
  };
};
```

---

### Feature 6: Add Chunked Logo to Splash Screen

#### Files to Modify/Create:
1. Create `/apps/mobile/assets/chunked-logo.png`
   - Copy logo from Desktop: `chunked.png`
   - Create @2x and @3x versions

2. Update `/apps/mobile/App.tsx`
   - Add logo to splash screen
   - Apply teal-green gradient background

3. Update `/apps/mobile/app.json`
   - Set splash screen background to gradient (if possible)
   - Set splash image to logo

#### Implementation:
```jsx
// Splash Screen Component
<LinearGradient
  colors={['#008080', '#40E0D0']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.splash}
>
  <Image
    source={require('./assets/chunked-logo.png')}
    style={styles.logo}
    resizeMode="contain"
  />
</LinearGradient>
```

---

### Feature 7: Implement Teal-Green Gradient Theme Throughout

#### Files to Modify:
1. `/apps/mobile/src/app/(tabs)/_layout.jsx`
   - Update tab bar with gradient accent
   - Use brand teal for active tabs

2. `/apps/mobile/src/app/(tabs)/new-round.jsx`
   - Add gradient header
   - Update button styles to brand colors

3. `/apps/mobile/src/app/(tabs)/journal.jsx`
   - Add gradient accents to cards
   - Update score indicators with brand colors

4. `/apps/mobile/src/app/(tabs)/profile.jsx`
   - Add gradient header
   - Update stat cards with brand styling

5. `/apps/mobile/src/app/round-logger.jsx`
   - Add gradient header
   - Update hole cards with brand accents

6. All modals and popups
   - Use gradient buttons
   - Apply glass morphism with teal tint

#### Color Usage Guide:
- **Primary Actions**: Gradient (`brandTealDark` → `brandTealLight`)
- **Headers**: Gradient background with white text
- **Cards**: Glass with teal border
- **Accents**: `brandTealMid` for highlights
- **Text on Gradient**: Always `brandWhite` (#FFFFFF)

---

## 📋 Implementation Order (Priority)

### Phase 1: Critical Fixes (Do First)
1. ✅ Fix unrealistic numbers and scoring logic
2. ✅ Update theme with brand colors
3. ✅ Create ThemedModal component
4. ✅ Replace all Alert.alert() with ThemedModal

### Phase 2: Core Features
5. ⬜ Add shot quality slider (0-10 scale)
6. ⬜ Update club selection to dropdown
7. ⬜ Create hole-by-hole review interface
8. ⬜ Apply gradient theme throughout app

### Phase 3: Data & Polish
9. ⬜ Integrate golf course API
10. ⬜ Add 25+ manual courses for demo
11. ⬜ Add Chunked logo to splash screen
12. ⬜ Generate realistic sample data (all score ranges)

---

## 🎨 Design System Reference

### Brand Colors
```javascript
brandTealDark: '#008080'    // Deep teal (gradient start)
brandTealMid: '#20A0A0'     // Mid teal
brandTealLight: '#40E0D0'   // Turquoise (gradient end)
brandGreen: '#30D5B8'       // Green-teal blend
brandWhite: '#FFFFFF'       // Logo white
```

### Gradient Usage
```javascript
<LinearGradient
  colors={['#008080', '#40E0D0']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
>
  {/* Content */}
</LinearGradient>
```

### Typography
- **Headers**: 600 weight, white on gradient
- **Body**: 400 weight, high contrast
- **Labels**: 500 weight

### Spacing
- Cards: 16px border radius
- Modals: 24px border radius
- Padding: 16px standard, 24px for containers
- Gap: 12px between elements

---

## 📦 Dependencies to Install

```bash
cd apps/mobile
npm install @react-native-community/slider
npm install @react-native-picker/picker  # (already installed)
npm install expo-linear-gradient  # (already installed)
npm install react-native-reanimated  # (already installed)
```

---

## 🧪 Testing Checklist

### Shot Logging
- [ ] Can select all 18 clubs from dropdown
- [ ] Slider moves smoothly from 0-10
- [ ] Descriptor updates in real-time
- [ ] Can still select quality tags (optional)
- [ ] Shot saves with all data

### Hole Review
- [ ] Can tap holes in round logger
- [ ] Can tap holes in journal
- [ ] Shows all shot details correctly
- [ ] Navigation between holes works
- [ ] Summary is accurate

### Modals
- [ ] All modals match brand theme
- [ ] Buttons have correct colors (gradient/glass/destructive)
- [ ] Haptic feedback works
- [ ] Blur backdrop looks good

### Scoring
- [ ] Profile shows realistic average
- [ ] Journal shows correct shot totals
- [ ] Score descriptions match ranges
- [ ] Sample data covers all score ranges

### Theme
- [ ] Gradient appears on all screens
- [ ] Colors are consistent
- [ ] White text is readable on gradient
- [ ] Glass morphism looks polished

---

## 🚀 Deployment Notes

After all features are implemented:

1. Test on physical device (not just simulator)
2. Verify API keys are in `.env` (not committed)
3. Test with real golf course searches
4. Verify all haptic feedback works on device
5. Test in both light and dark mode
6. Verify logo appears correctly at all resolutions
7. Test memory usage with large round counts

---

## 📞 Questions for User

1. **API Budget**: Are you okay with ~$10/month for golf course API (RapidAPI)?
2. **Logo Files**: Can you provide logo in multiple sizes (1x, 2x, 3x)?
3. **Course Priority**: Which 25 courses do you want pre-loaded besides Newton Commonwealth and Wayland CC?

---

*Last Updated: [Current Date]*
*Status: Phase 1 - In Progress*
