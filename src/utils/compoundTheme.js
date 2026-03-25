// Utilities for compound theme values like 'dance-party:princess'

export const ACTIVITY_TYPES = ['drama-party', 'dance-party', 'music-party'];

export const ACTIVITY_DISPLAY_NAMES = {
  'drama-party': 'Drama Party',
  'dance-party': 'Dance Party',
  'music-party': 'Music Party',
};

const ENTERTAINMENT_TYPE_MAP = {
  'drama-party': 'Drama Party',
  'dance-party': 'Dance Party',
  'music-party': 'Music Party',
};

// 'dance-party:princess' -> { activityType: 'dance-party', subTheme: 'princess' }
// 'dance-party'          -> { activityType: 'dance-party', subTheme: null }
// 'princess'             -> { activityType: null, subTheme: 'princess' }
export function parseCompoundTheme(theme) {
  if (!theme) return { activityType: null, subTheme: null };
  const parts = theme.split(':');
  if (parts.length === 2) {
    return { activityType: parts[0], subTheme: parts[1] };
  }
  if (ACTIVITY_TYPES.includes(theme)) {
    return { activityType: theme, subTheme: null };
  }
  return { activityType: null, subTheme: theme };
}

// ('dance-party', 'princess') -> 'dance-party:princess'
// ('dance-party', null)       -> 'dance-party'
export function buildCompoundTheme(activityType, subTheme) {
  if (!subTheme) return activityType;
  return `${activityType}:${subTheme}`;
}

// Returns true if theme is or contains a performance party activity type
export function isPerformanceParty(theme) {
  if (!theme) return false;
  const { activityType } = parseCompoundTheme(theme);
  return ACTIVITY_TYPES.includes(activityType);
}

// 'dance-party:princess' -> 'Princess Dance Party'
// 'dance-party'          -> 'Dance Party'
// 'princess'             -> 'Princess' (backward-compatible fallback)
export function getThemeDisplayName(theme) {
  if (!theme) return '';
  const { activityType, subTheme } = parseCompoundTheme(theme);

  if (activityType && ACTIVITY_TYPES.includes(activityType)) {
    const activityLabel = ACTIVITY_DISPLAY_NAMES[activityType];
    if (subTheme) {
      const subLabel = subTheme
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return `${subLabel} ${activityLabel}`;
    }
    return activityLabel;
  }

  // Fallback: plain theme like 'princess' or 'kpop-demon-hunters'
  return theme
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Activity-only themes that don't have matching cakes/bags/decorations
// These should be treated as 'no-theme' for non-entertainment categories
const ACTIVITY_ONLY_THEMES = ['disco', 'magic-and-games'];

// For non-entertainment categories: extract sub-theme for matching
// 'dance-party:princess' -> 'princess'
// 'dance-party'          -> null
// 'princess'             -> 'princess'
// 'disco'                -> null (activity-only, no themed cakes/bags)
export function getEffectiveThemeForCategory(theme) {
  const { activityType, subTheme } = parseCompoundTheme(theme);
  if (activityType && ACTIVITY_TYPES.includes(activityType)) {
    return subTheme; // may be null
  }
  if (ACTIVITY_ONLY_THEMES.includes(theme)) {
    return null;
  }
  return theme;
}

// 'dance-party' -> 'Dance Party' (the entertainmentType label for supplier matching)
export function getEntertainmentTypeLabel(activityType) {
  return ENTERTAINMENT_TYPE_MAP[activityType] || null;
}
