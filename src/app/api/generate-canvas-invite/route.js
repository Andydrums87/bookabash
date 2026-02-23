// Canvas-based invite generation - composites text onto background images
// No external API costs, uses node-canvas for server-side rendering

import { createCanvas, loadImage, registerFont } from 'canvas'
import { v2 as cloudinary } from 'cloudinary'
import path from 'path'
import fs from 'fs'

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dghzq6xtd',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Register custom fonts for node-canvas
// IMPORTANT: Each font file should only be registered ONCE with its actual weight
// node-canvas will use the font's embedded weight, not what you specify
const fontsDir = path.join(process.cwd(), 'public', 'fonts')

// Helper to safely register a font
function safeRegisterFont(filename, family, weight = 'normal') {
  const fontPath = path.join(fontsDir, filename)
  if (fs.existsSync(fontPath)) {
    try {
      registerFont(fontPath, { family, weight })
      console.log(`✅ ${family} (${weight}) registered from ${filename}`)
      return true
    } catch (err) {
      console.warn(`⚠️ Failed to register ${family}: ${err.message}`)
      return false
    }
  } else {
    console.warn(`⚠️ Font file not found: ${filename}`)
    return false
  }
}

// Register all fonts at startup
try {
  // Impact - bold condensed font for headlines
  safeRegisterFont('Impact.ttf', 'Impact', 'normal')

  // Bangers - comic style font (single weight)
  safeRegisterFont('Bangers-Regular.ttf', 'Bangers', 'normal')

  // Montserrat - clean sans-serif
  safeRegisterFont('Montserrat-Regular.ttf', 'Montserrat', 'normal')
  safeRegisterFont('Montserrat-Bold.ttf', 'Montserrat', 'bold')

  // Nunito - rounded sans-serif (register as bold since templates use fontWeight: 'bold')
  safeRegisterFont('Nunito-Bold.ttf', 'Nunito', 'bold')

  // Bagel Fat One - playful rounded (single weight font)
  safeRegisterFont('BagelFatOne-Regular.ttf', 'Bagel Fat One', 'normal')

  // Baloo 2 - rounded bubbly (register as normal - the Bold ttf file already has bold weight baked in)
  safeRegisterFont('Baloo2-Bold.ttf', 'Baloo 2', 'normal')

  // Lilita One - bold rounded (single weight font)
  safeRegisterFont('LilitaOne-Regular.ttf', 'Lilita One', 'normal')

  // Coiny - playful rounded (single weight font)
  safeRegisterFont('Coiny-Regular.ttf', 'Coiny', 'normal')

  // Princess Sofia - elegant script for princess theme
  safeRegisterFont('PrincessSofia-Regular.ttf', 'Princess Sofia', 'normal')

  // Cormorant Garamond - elegant serif for princess theme
  safeRegisterFont('CormorantGaramond-Regular.ttf', 'Cormorant Garamond', 'normal')
  safeRegisterFont('CormorantGaramond-Bold.ttf', 'Cormorant Garamond', 'bold')

  // Luckiest Guy - playful bold display font
  safeRegisterFont('LuckiestGuy-Regular.ttf', 'Luckiest Guy', 'normal')

  // Orbitron - futuristic/space font
  safeRegisterFont('Orbitron-Regular.ttf', 'Orbitron', 'normal')

  // Audiowide - futuristic/tech font
  safeRegisterFont('Audiowide-Regular.ttf', 'Audiowide', 'normal')

  // Fredoka - rounded playful font (bold weight)
  safeRegisterFont('Fredoka-Bold.ttf', 'Fredoka', 'bold')

  // Ice Kingdom - icy/frozen style font
  safeRegisterFont('Icekingdom.ttf', 'Ice Kingdom', 'normal')

  // Spicy Sale - whimsical unicorn/fantasy font
  safeRegisterFont('SpicySale.ttf', 'Spicy Sale', 'normal')

  // K-Pop Demon Hunter - stylized K-pop themed font
  safeRegisterFont('KpopDemonHunter.ttf', 'Kpop Demon Hunter', 'normal')

  console.log('✅ Font registration complete')
} catch (err) {
  console.warn('⚠️ Font registration error:', err.message)
}

// Template configurations per theme
// Each template defines: background image, text zones with positions, fonts, colors, sizes
// Template configurations per theme
// Image: 848x1216 pixels, centerX = 424
const TEMPLATE_CONFIGS = {
  superhero: {
    background: '/invite-backgrounds/superhero.png',
    width: 848,
    height: 1216,
    textZones: [
      {
        id: 'name',
        x: 375,
        y: 339,
        fontSize: 177,
        font: 'Bangers',
        fontWeight: 'bold',
        color: '#FFD700',
        strokeColor: '#000000',
        strokeWidth: 4,
        align: 'center',
        transform: 'uppercase',
        letterSpacing: 10,
        maxWidth: 466,
        minFontSize: 71,
        autoScale: true
      },
      {
        id: 'turns',
        x: 397,
        y: 471,
        fontSize: 102,
        font: 'Bangers',
        fontWeight: 'bold',
        color: '#000000',
        strokeColor: '#FFD700',
        strokeWidth: 2,
        align: 'right',
        transform: 'uppercase',
        letterSpacing: 4
      },
      {
        id: 'age',
        x: 434,
        y: 500,
        fontSize: 212,
        font: 'Bangers',
        fontWeight: 'bold',
        color: '#000000',
        strokeColor: '#FFD700',
        strokeWidth: 10,
        align: 'left'
      },
      {
        id: 'dateTime',
        x: 424,
        y: 726,
        fontSize: 36,
        font: 'Impact',
        fontWeight: 'bold',
        color: '#333333',
        align: 'center'
      },
      {
        id: 'venue',
        x: 424,
        y: 794,
        fontSize: 26,
        font: 'Impact',
        fontWeight: 'bold',
        color: '#444444',
        align: 'center',
        maxWidth: 370,
        multiline: true,
        lineHeight: 1.3
      }
    ]
  },
  mermaid: {
    background: "/invite-backgrounds/mermaid.png",
    width: 1024,
    height: 1536,
    textZones: [
      {
        id: 'name',
        x: 512,
        y: 469,
        fontSize: 242,
        font: 'Fredoka',
        fontWeight: '600',
        color: '#F05C78',
        align: 'center',
        maxWidth: 490,
        minFontSize: 72,
        autoScale: true
      },
      {
        id: 'turns',
        text: 'is turning',
        x: 518,
        y: 613,
        fontSize: 54,
        font: 'Fredoka',
        fontWeight: 'normal',
        color: '#2DB7B0',
        align: 'center'
      },
      {
        id: 'age',
        x: 523,
        y: 817,
        fontSize: 322,
        font: 'Fredoka',
        fontWeight: '900',
        color: '#F05C78',
        align: 'center'
      },
      {
        id: 'dateTime',
        text: 'Saturday 20th June 2pm - 4pm',
        x: 531,
        y: 1010,
        fontSize: 39,
        font: 'Fredoka',
        fontWeight: 'normal',
        color: '#333333',
        align: 'center',
        maxWidth: 341,
        multiline: true,
        lineHeight: 1.2
      },
      {
        id: 'venue',
        x: 526,
        y: 1139,
        fontSize: 37,
        font: 'Fredoka',
        fontWeight: 'normal',
        color: '#525252',
        align: 'center',
        maxWidth: 440,
        multiline: true,
        lineHeight: 1.3
      }
    ]
  },
  pirate: {
    background: "/invite-backgrounds/pirate.png",
    width: 1024,
    height: 1536,
    textZones: [
      {
        id: 'name',
        x: 525,
        y: 525,
        fontSize: 270,
        font: 'Bangers',
        fontWeight: 'bold',
        color: '#4B2E1E',
        align: 'center',
        transform: 'lowercase',
        letterSpacing: 6,
        maxWidth: 800,
        minFontSize: 80,
        autoScale: true
      },
      {
        id: 'turns',
        text: 'is turning',
        x: 655,
        y: 683,
        fontSize: 47,
        font: 'Courier New',
        fontWeight: 'bold',
        color: '#4B2E1E',
        align: 'right'
      },
      {
        id: 'age',
        x: 495,
        y: 899,
        fontSize: 347,
        font: 'Bangers',
        fontWeight: 'bold',
        color: '#4B2E1E',
        align: 'center'
      },
      {
        id: 'dateTime',
        text: 'Saturday 20th June  2pm - 4pm',
        x: 519,
        y: 1118,
        fontSize: 44,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#3A2418',
        align: 'center',
        maxWidth: 475,
        multiline: true,
        lineHeight: 1.2
      },
      {
        id: 'venue',
        x: 524,
        y: 1230,
        fontSize: 31,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#3A2418',
        align: 'center',
        maxWidth: 580,
        multiline: true,
        lineHeight: 1.1
      }
    ]
  },
  princess: {
    background: "/invite-backgrounds/princess.png",
    width: 1024,
    height: 1536,
    textZones: [
      {
        id: 'name',
        x: 526,
        y: 496,
        fontSize: 287,
        font: 'Cormorant Garamond',
        fontWeight: 'bold',
        color: '#E91E8C',
        align: 'center',
        maxWidth: 729,
        minFontSize: 72,
        autoScale: true
      },
      {
        id: 'turns',
        text: 'is turning',
        x: 512,
        y: 628,
        fontSize: 54,
        font: 'Cormorant Garamond',
        fontWeight: 'normal',
        color: '#9B59B6',
        align: 'center'
      },
      {
        id: 'age',
        x: 512,
        y: 766,
        fontSize: 433,
        font: 'Cormorant Garamond',
        fontWeight: 'bold',
        color: '#E91E8C',
        align: 'center'
      },
      {
        id: 'dateTime',
        text: 'Saturday 20th June 2pm-4pm',
        x: 512,
        y: 1122,
        fontSize: 49,
        font: 'Cormorant Garamond',
        fontWeight: 'bold',
        color: '#5D3A6E',
        align: 'center',
        maxWidth: 400,
        multiline: true,
        lineHeight: 1.2
      },
      {
        id: 'venue',
        x: 512,
        y: 1300,
        fontSize: 49,
        font: 'Cormorant Garamond',
        fontWeight: 'bold',
        color: '#5D3A6E',
        align: 'center',
        maxWidth: 595,
        multiline: true,
        lineHeight: 1.3
      }
    ]
  },
  dinosaur: {
    background: "/invite-backgrounds/dinosaur.png",
    width: 1024,
    height: 1536,
    textZones: [
      {
        id: 'name',
        x: 512,
        y: 391,
        fontSize: 200,
        font: 'Lilita One',
        fontWeight: 'normal',
        color: '#4A3728',
        align: 'center',
        transform: 'uppercase',
        maxWidth: 700,
        minFontSize: 80,
        autoScale: true
      },
      {
        id: 'turns',
        text: 'is turning',
        x: 512,
        y: 535,
        fontSize: 50,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#2D5A27',
        align: 'center'
      },
      {
        id: 'age',
        x: 512,
        y: 728,
        fontSize: 339,
        font: 'Lilita One',
        fontWeight: 'normal',
        color: '#4A3728',
        align: 'center'
      },
      {
        id: 'dateTime',
        text: 'Saturday 20th June 2pm - 4pm',
        x: 533,
        y: 996,
        fontSize: 40,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#3A2418',
        align: 'center',
        maxWidth: 388,
        multiline: true,
        lineHeight: 1.2
      },
      {
        id: 'venue',
        x: 512,
        y: 1165,
        fontSize: 35,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#3A2418',
        align: 'center',
        maxWidth: 426,
        multiline: true,
        lineHeight: 1.3
      }
    ]
  },
  science: {
    background: "/invite-backgrounds/science.png",
    width: 1024,
    height: 1536,
    textZones: [
      {
        id: 'name',
        x: 512,
        y: 450,
        fontSize: 278,
        font: 'Bangers',
        fontWeight: 'normal',
        color: '#2E7D32',
        align: 'center',
        transform: 'uppercase',
        maxWidth: 574,
        minFontSize: 80,
        autoScale: true
      },
      {
        id: 'turns',
        text: 'is turning',
        x: 534,
        y: 620,
        fontSize: 50,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#1B5E20',
        align: 'center'
      },
      {
        id: 'age',
        x: 504,
        y: 866,
        fontSize: 418,
        font: 'Bangers',
        fontWeight: 'normal',
        color: '#AEEA00',
        strokeColor: '#2E7D32',
        strokeWidth: 8,
        align: 'center'
      },
      {
        id: 'dateTime',
        x: 512,
        y: 1121,
        fontSize: 42,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#1B5E20',
        align: 'center',
        maxWidth: 450,
        multiline: true,
        lineHeight: 1.2
      },
      {
        id: 'venue',
        x: 512,
        y: 1259,
        fontSize: 36,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#2E7D32',
        align: 'center',
        maxWidth: 500,
        multiline: true,
        lineHeight: 1.3
      }
    ]
  },
  space: {
    background: "/invite-backgrounds/space.png",
    width: 1024,
    height: 1536,
    textZones: [
      {
        id: 'name',
        x: 551,
        y: 341,
        fontSize: 121,
        font: 'Orbitron',
        fontWeight: '900',
        color: '#FFFFFF',
        align: 'center',
        transform: 'uppercase',
        maxWidth: 700,
        minFontSize: 80,
        autoScale: true
      },
      {
        id: 'turns',
        text: 'is turning',
        x: 536,
        y: 444,
        fontSize: 50,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#81D4FA',
        align: 'center'
      },
      {
        id: 'age',
        x: 515,
        y: 651,
        fontSize: 334,
        font: 'Orbitron',
        fontWeight: '600',
        color: '#FFFFFF',
        strokeColor: '#FFFFFF',
        strokeWidth: 6,
        align: 'center'
      },
      {
        id: 'dateTime',
        text: 'Saturday 20th June 2pm - 4pm',
        x: 532,
        y: 927,
        fontSize: 42,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#FFFFFF',
        align: 'center',
        maxWidth: 450,
        multiline: true,
        lineHeight: 1.2
      },
      {
        id: 'venue',
        x: 544,
        y: 1079,
        fontSize: 36,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#B3E5FC',
        align: 'center',
        maxWidth: 500,
        multiline: true,
        lineHeight: 1.3
      }
    ]
  },
  spiderman: {
    background: "/invite-backgrounds/spiderman.png",
    width: 1024,
    height: 1536,
    textZones: [
      {
        id: 'name',
        x: 425,
        y: 262,
        fontSize: 226,
        font: 'Bangers',
        fontWeight: 'normal',
        color: '#CC1A1A',
        strokeColor: '#1A1A1A',
        strokeWidth: 12,
        align: 'center',
        transform: 'uppercase',
        letterSpacing: 10,
        rotation: -6,
        maxWidth: 700,
        minFontSize: 80,
        autoScale: true
      },
      {
        id: 'turns',
        text: 'IS TURNING',
        x: 444,
        y: 384,
        fontSize: 42,
        font: 'Bangers',
        fontWeight: 'normal',
        color: '#1A1A1A',
        align: 'center',
        letterSpacing: 3
      },
      {
        id: 'age',
        x: 416,
        y: 574,
        fontSize: 307,
        font: 'Bangers',
        fontWeight: 'normal',
        color: '#CC1A1A',
        strokeColor: '#1A1A1A',
        strokeWidth: 8,
        align: 'center'
      },
      {
        id: 'dateTime',
        text: 'June 20, 2028 2pm - 4pm',
        x: 568,
        y: 773,
        fontSize: 36,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#1A1A1A',
        align: 'center',
        maxWidth: 300,
        multiline: true,
        lineHeight: 1.3
      },
      {
        id: 'venue',
        x: 566,
        y: 891,
        fontSize: 25,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#1A1A1A',
        align: 'center',
        maxWidth: 274,
        multiline: true,
        lineHeight: 1.3
      }
    ]
  },
  safari: {
    background: "/invite-backgrounds/safari.png",
    width: 1024,
    height: 1536,
    textZones: [
      {
        id: 'name',
        x: 519,
        y: 428,
        fontSize: 180,
        font: 'Lilita One',
        fontWeight: 'normal',
        color: '#4A6741',
        strokeColor: '#2D3B2D',
        strokeWidth: 6,
        align: 'center',
        transform: 'uppercase',
        maxWidth: 578,
        minFontSize: 80,
        autoScale: true
      },
      {
        id: 'turns',
        text: 'is turning',
        x: 512,
        y: 560,
        fontSize: 50,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#6B4423',
        align: 'center'
      },
      {
        id: 'age',
        x: 512,
        y: 783,
        fontSize: 382,
        font: 'Lilita One',
        fontWeight: 'normal',
        color: '#8B6914',
        strokeColor: '#4A3520',
        strokeWidth: 8,
        align: 'center'
      },
      {
        id: 'dateTime',
        text: 'June 20, 2028 2pm - 4pm',
        x: 512,
        y: 1026,
        fontSize: 42,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#4A3520',
        align: 'center',
        maxWidth: 273,
        multiline: true,
        lineHeight: 1.3
      },
      {
        id: 'venue',
        x: 512,
        y: 1167,
        fontSize: 36,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#5D4E37',
        align: 'center',
        maxWidth: 450,
        multiline: true,
        lineHeight: 1.3
      }
    ]
  },
  frozen: {
    background: "/invite-backgrounds/frozen.png",
    width: 1024,
    height: 1536,
    textZones: [
      {
        id: 'name',
        x: 438,
        y: 280,
        fontSize: 160,
        font: 'Ice Kingdom',
        fontWeight: 'normal',
        color: '#adffff',
        strokeColor: '#4169E1',
        strokeWidth: 5,
        align: 'center',
        maxWidth: 700,
        minFontSize: 80,
        autoScale: true
      },
      {
        id: 'turns',
        text: 'is turning',
        x: 421,
        y: 392,
        fontSize: 50,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#2e4c56',
        align: 'center'
      },
      {
        id: 'age',
        x: 429,
        y: 601,
        fontSize: 346,
        font: 'Ice Kingdom',
        fontWeight: 'normal',
        color: '#adffff',
        strokeColor: '#4B0082',
        strokeWidth: 6,
        align: 'center'
      },
      {
        id: 'dateTime',
        text: 'June 20, 2028 2pm - 4pm',
        x: 432,
        y: 792,
        fontSize: 31,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#2e4c56',
        align: 'center',
        maxWidth: 201,
        multiline: true,
        lineHeight: 1.3
      },
      {
        id: 'venue',
        x: 428,
        y: 930,
        fontSize: 28,
        font: 'Nunito',
        fontWeight: 'bold',
        color: '#2e4c56',
        align: 'center',
        maxWidth: 302,
        multiline: true,
        lineHeight: 1.3
      }
    ]
  },
  unicorn: {
    background: "/invite-backgrounds/unicorn.png",
    width: 1024,
    height: 1536,
    textZones: [
      {
        id: 'name',
        x: 419,
        y: 280,
        fontSize: 140,
        font: 'Spicy Sale',
        fontWeight: 'normal',
        color: '#F5A9C4',
        strokeColor: '#FFFFFF',
        strokeWidth: 3,
        align: 'center',
        maxWidth: 431,
        minFontSize: 70,
        autoScale: true
      },
      {
        id: 'turns',
        text: 'is turning',
        x: 420,
        y: 367,
        fontSize: 37,
        font: 'Fredoka',
        fontWeight: '600',
        color: '#9C6ADE',
        align: 'center'
      },
      {
        id: 'age',
        x: 413,
        y: 496,
        fontSize: 236,
        font: 'Spicy Sale',
        fontWeight: 'normal',
        color: '#F5A9C4',
        strokeColor: '#E6C065',
        strokeWidth: 0,
        align: 'center'
      },
      {
        id: 'dateTime',
        text: 'Saturday 20th June 2pm - 4pm',
        x: 423,
        y: 671,
        fontSize: 39,
        font: 'Fredoka',
        fontWeight: 'normal',
        color: '#6E4B7E',
        align: 'center',
        maxWidth: 424,
        multiline: true,
        lineHeight: 1.3
      },
      {
        id: 'venue',
        x: 442,
        y: 781,
        fontSize: 30,
        font: 'Fredoka',
        fontWeight: 'normal',
        color: '#6E4B7E',
        align: 'center',
        maxWidth: 463,
        multiline: true,
        lineHeight: 1.3
      }
    ]
  },
  kpop: {
    background: "/invite-backgrounds/kpop.png",
    width: 1024,
    height: 1536,
    textZones: [
      {
        id: 'header',
        x: 512,
        y: 340,
        fontSize: 36,
        font: 'Montserrat',
        fontWeight: 'bold',
        color: '#FFFFFF',
        align: 'center',
        letterSpacing: 3
      },
      {
        id: 'name',
        x: 308,
        y: 548,
        fontSize: 111,
        font: 'Kpop Demon Hunter',
        fontWeight: '900',
        color: '#e1b0f7',
        strokeColor: '#1A1A1A',
        strokeWidth: 3,
        align: 'center',
        maxWidth: 900,
        minFontSize: 60,
        autoScale: true
      },
      {
        id: 'turns',
        text: 'is turning ',
        x: 304,
        y: 619,
        fontSize: 29,
        font: 'Montserrat',
        fontWeight: 'bold',
        color: '#e1b0f7',
        align: 'center'
      },
      {
        id: 'age',
        x: 306,
        y: 717,
        fontSize: 143,
        font: 'Kpop Demon Hunter',
        fontWeight: '900',
        color: '#e1b0f7',
        align: 'center'
      },
      {
        id: 'dateTime',
        text: 'June 20 2pm - 4pm',
        x: 136,
        y: 884,
        fontSize: 32,
        font: 'Montserrat',
        fontWeight: 'bold',
        color: '#FFFFFF',
        align: 'center',
        maxWidth: 141,
        multiline: true,
        lineHeight: 1.4
      },
      {
        id: 'venue',
        x: 440,
        y: 888,
        fontSize: 29,
        font: 'Montserrat',
        fontWeight: 'bold',
        color: '#FFFFFF',
        align: 'center',
        maxWidth: 308,
        multiline: true,
        lineHeight: 1.3
      }
    ]
  }
}

// Note: Using system fonts (Impact, Arial) for reliability
// Custom fonts can be registered if needed but require proper font file handling

// Format date for display
function formatDate(dateStr) {
  if (!dateStr) return ''

  try {
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      const dateObj = new Date(dateStr)
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
      const day = dateObj.getDate()
      const month = months[dateObj.getMonth()]
      const year = dateObj.getFullYear()
      return `${month} ${day}, ${year}`
    }
    return dateStr
  } catch {
    return dateStr
  }
}

// Helper to measure text with letter spacing
function measureTextWithSpacing(ctx, text, letterSpacing) {
  if (!letterSpacing || letterSpacing === 0) {
    return ctx.measureText(text).width
  }
  let totalWidth = 0
  for (let i = 0; i < text.length; i++) {
    totalWidth += ctx.measureText(text[i]).width + (i < text.length - 1 ? letterSpacing : 0)
  }
  return totalWidth
}

// Helper to draw text with letter spacing
function fillTextWithSpacing(ctx, text, x, y, letterSpacing, align) {
  if (!letterSpacing || letterSpacing === 0) {
    ctx.fillText(text, x, y)
    return
  }

  let totalWidth = measureTextWithSpacing(ctx, text, letterSpacing)
  let currentX = x
  if (align === 'center') {
    currentX = x - totalWidth / 2
  } else if (align === 'right') {
    currentX = x - totalWidth
  }

  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], currentX, y)
    currentX += ctx.measureText(text[i]).width + letterSpacing
  }
}

// Helper to stroke text with letter spacing
function strokeTextWithSpacing(ctx, text, x, y, letterSpacing, align) {
  if (!letterSpacing || letterSpacing === 0) {
    ctx.strokeText(text, x, y)
    return
  }

  let totalWidth = measureTextWithSpacing(ctx, text, letterSpacing)
  let currentX = x
  if (align === 'center') {
    currentX = x - totalWidth / 2
  } else if (align === 'right') {
    currentX = x - totalWidth
  }

  for (let i = 0; i < text.length; i++) {
    ctx.strokeText(text[i], currentX, y)
    currentX += ctx.measureText(text[i]).width + letterSpacing
  }
}

// Draw text with optional stroke, auto-scaling, letter spacing, and rotation
function drawText(ctx, text, zone) {
  const {
    x, y, maxWidth, font, fontSize, fontWeight, color,
    strokeColor, strokeWidth, align, transform, multiline, lineHeight = 1.2,
    autoScale, minFontSize = 60, letterSpacing = 0, rotation = 0
  } = zone

  // Apply transform
  let displayText = text
  if (transform === 'uppercase') {
    displayText = text.toUpperCase()
  }

  // Calculate actual font size (auto-scale if enabled)
  let actualFontSize = fontSize
  const weight = fontWeight || ''

  if (autoScale && maxWidth) {
    // Start with the configured font size and scale down if needed
    ctx.font = `${weight} ${fontSize}px ${font}, Arial, sans-serif`.trim()
    let textWidth = measureTextWithSpacing(ctx, displayText, letterSpacing)

    // Scale down until text fits within maxWidth or we hit minFontSize
    while (textWidth > maxWidth && actualFontSize > minFontSize) {
      actualFontSize -= 5  // Decrease by 5px increments
      ctx.font = `${weight} ${actualFontSize}px ${font}, Arial, sans-serif`.trim()
      textWidth = measureTextWithSpacing(ctx, displayText, letterSpacing)
    }

    console.log(`📏 Auto-scaled "${displayText}": ${fontSize}px → ${actualFontSize}px (width: ${Math.round(textWidth)}px, max: ${maxWidth}px)`)
  }

  // Set final font
  ctx.font = `${weight} ${actualFontSize}px ${font}, Arial, sans-serif`.trim()
  ctx.textAlign = letterSpacing ? 'left' : (align || 'center') // Use left for manual spacing
  ctx.textBaseline = 'middle'

  // Scale stroke width proportionally if font was scaled
  const scaledStrokeWidth = strokeWidth ? Math.round(strokeWidth * (actualFontSize / fontSize)) : 0

  // Save context for rotation
  ctx.save()

  // Apply rotation around the text position
  if (rotation !== 0) {
    ctx.translate(x, y)
    ctx.rotate((rotation * Math.PI) / 180) // Convert degrees to radians
    ctx.translate(-x, -y)
  }

  if (multiline && maxWidth && !autoScale) {
    // Handle multiline text (not used with autoScale)
    const words = displayText.split(' ')
    const lines = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      lines.push(currentLine)
    }

    // Draw each line
    const totalHeight = lines.length * actualFontSize * lineHeight
    let startY = y - totalHeight / 2 + actualFontSize / 2

    for (const line of lines) {
      if (strokeColor && scaledStrokeWidth) {
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = scaledStrokeWidth
        strokeTextWithSpacing(ctx, line, x, startY, letterSpacing, align)
      }
      ctx.fillStyle = color
      fillTextWithSpacing(ctx, line, x, startY, letterSpacing, align)
      startY += actualFontSize * lineHeight
    }
  } else {
    // Single line (or auto-scaled text)
    if (strokeColor && scaledStrokeWidth) {
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = scaledStrokeWidth
      ctx.lineJoin = 'round'
      strokeTextWithSpacing(ctx, displayText, x, y, letterSpacing, align)
    }
    ctx.fillStyle = color
    fillTextWithSpacing(ctx, displayText, x, y, letterSpacing, align)
  }

  // Restore context after rotation
  ctx.restore()
}

export async function POST(request) {
  try {
    const {
      theme,
      childName,
      age,
      date,
      time,
      venue
    } = await request.json()

    console.log('🎨 Generating canvas invite for:', childName)
    console.log('🎯 Theme:', theme)

    // Get template config
    const config = TEMPLATE_CONFIGS[theme]
    if (!config) {
      return Response.json({
        success: false,
        error: `No template found for theme: ${theme}`
      }, { status: 400 })
    }

    // Load background image
    const backgroundPath = path.join(process.cwd(), 'public', config.background)

    if (!fs.existsSync(backgroundPath)) {
      return Response.json({
        success: false,
        error: `Background image not found: ${config.background}`
      }, { status: 404 })
    }

    const backgroundImage = await loadImage(backgroundPath)

    // Create canvas with image dimensions
    const width = backgroundImage.width || config.width
    const height = backgroundImage.height || config.height
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, width, height)

    // Prepare text data
    const textData = {
      name: childName,
      turns: 'TURNS',
      age: age?.toString() || '',
      dateTime: `${formatDate(date)} | ${time}`,
      venue: venue
    }

    // Draw each text zone
    for (const zone of config.textZones) {
      const text = zone.text || textData[zone.id]
      if (text) {
        drawText(ctx, text, zone)
      }
    }

    // Convert to PNG buffer
    const buffer = canvas.toBuffer('image/png')

    // Convert to base64 data URL
    const base64 = buffer.toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    // Upload to Cloudinary for persistent hosting
    let cloudinaryUrl = null
    try {
      const timestamp = Date.now()
      const filename = `${childName?.replace(/\s+/g, '-') || 'invite'}-${theme}-${timestamp}`

      const uploadResult = await cloudinary.uploader.upload(dataUrl, {
        public_id: filename,
        folder: 'canvas-invites',
        format: 'png',
        quality: 'auto:best'
      })

      cloudinaryUrl = uploadResult.secure_url
      console.log('✅ Uploaded to Cloudinary:', cloudinaryUrl)
    } catch (uploadError) {
      console.warn('⚠️ Cloudinary upload failed, using base64:', uploadError.message)
      // Fall back to base64 if upload fails
    }

    console.log('✅ Canvas invite generated successfully')

    return Response.json({
      success: true,
      imageUrl: cloudinaryUrl || dataUrl,
      localImageUrl: dataUrl,
      metadata: {
        theme,
        childName,
        age,
        date,
        time,
        venue,
        width,
        height,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Canvas invite generation error:', error)

    return Response.json({
      success: false,
      error: error.message || 'Failed to generate invite'
    }, { status: 500 })
  }
}
