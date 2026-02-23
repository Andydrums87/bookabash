// Invite template metadata and theme categories
// Used for the e-invites creator UI

// Theme categories with display info
export const THEME_CATEGORIES = [
  { id: 'superhero', name: 'Superhero', icon: '🦸', color: '#FF6B35' },
  { id: 'princess', name: 'Princess', icon: '👸', color: '#FF69B4' },
  { id: 'mermaid', name: 'Mermaid', icon: '🧜‍♀️', color: '#00CED1' },
  { id: 'pirate', name: 'Pirate', icon: '🏴‍☠️', color: '#8B4513' },
  { id: 'dinosaur', name: 'Dinosaur', icon: '🦕', color: '#228B22' },
  { id: 'science', name: 'Science', icon: '🔬', color: '#9932CC' },
  { id: 'space', name: 'Space', icon: '🚀', color: '#191970' },
  { id: 'spiderman', name: 'Spiderman', icon: '🕷️', color: '#CC1A1A' },
  { id: 'safari', name: 'Safari', icon: '🦁', color: '#DAA520' },
  { id: 'frozen', name: 'Frozen', icon: '❄️', color: '#87CEEB' },
  { id: 'unicorn', name: 'Unicorn', icon: '🦄', color: '#E8A0BF' },
  { id: 'kpop', name: 'K-Pop', icon: '🎤', color: '#9932CC' },
]

// Templates per theme (future: add more templates per theme)
export const TEMPLATES_BY_THEME = {
  superhero: [
    {
      id: 'superhero',
      name: 'Classic Hero',
      thumbnail: '/invite-backgrounds/superhero.png',
    }
  ],
  princess: [
    {
      id: 'princess',
      name: 'Royal Ball',
      thumbnail: '/invite-backgrounds/princess.png',
    }
  ],
  mermaid: [
    {
      id: 'mermaid',
      name: 'Under the Sea',
      thumbnail: '/invite-backgrounds/mermaid.png',
    }
  ],
  pirate: [
    {
      id: 'pirate',
      name: 'Treasure Hunt',
      thumbnail: '/invite-backgrounds/pirate.png',
    }
  ],
  dinosaur: [
    {
      id: 'dinosaur',
      name: 'Dino Adventure',
      thumbnail: '/invite-backgrounds/dinosaur.png',
    }
  ],
  science: [
    {
      id: 'science',
      name: 'Mad Scientist',
      thumbnail: '/invite-backgrounds/science.png',
    }
  ],
  space: [
    {
      id: 'space',
      name: 'Galaxy Explorer',
      thumbnail: '/invite-backgrounds/space.png',
    }
  ],
  spiderman: [
    {
      id: 'spiderman',
      name: 'Web Slinger',
      thumbnail: '/invite-backgrounds/spiderman.png',
    }
  ],
  safari: [
    {
      id: 'safari',
      name: 'Wild Adventure',
      thumbnail: '/invite-backgrounds/safari.png',
    }
  ],
  frozen: [
    {
      id: 'frozen',
      name: 'Ice Kingdom',
      thumbnail: '/invite-backgrounds/frozen.png',
    }
  ],
  unicorn: [
    {
      id: 'unicorn',
      name: 'Magical Unicorn',
      thumbnail: '/invite-backgrounds/unicorn.png',
    }
  ],
  kpop: [
    {
      id: 'kpop',
      name: 'Demon Hunters',
      thumbnail: '/invite-backgrounds/kpop.png',
    }
  ],
}

// Helper to get theme category by ID
export function getThemeCategory(themeId) {
  return THEME_CATEGORIES.find(t => t.id === themeId)
}

// Helper to get templates for a theme
export function getTemplatesForTheme(themeId) {
  return TEMPLATES_BY_THEME[themeId] || []
}

// Helper to get template by ID
export function getTemplateById(templateId) {
  for (const templates of Object.values(TEMPLATES_BY_THEME)) {
    const found = templates.find(t => t.id === templateId)
    if (found) return found
  }
  return null
}

// Helper to get all template IDs
export function getAllTemplateIds() {
  const ids = []
  for (const templates of Object.values(TEMPLATES_BY_THEME)) {
    ids.push(...templates.map(t => t.id))
  }
  return ids
}
