// Shared canvas template configurations
// Used by both server-side (API route) and client-side (preview) rendering

export const TEMPLATE_CONFIGS = {
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

// Font configurations for client-side loading
export const FONT_CONFIGS = [
  // Google Fonts (loaded via URL)
  { family: 'Bangers', url: 'https://fonts.gstatic.com/s/bangers/v24/FeVQS0BTqb0h60ACH55Q2J5hm24.woff2', weight: '400' },
  { family: 'Cormorant Garamond', url: 'https://fonts.gstatic.com/s/cormorantgaramond/v20/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2', weight: '700' },
  { family: 'Princess Sofia', url: 'https://fonts.gstatic.com/s/princesssofia/v29/qWczB6yguIb8DZ_GXZst16n7GRzS8w.woff2', weight: '400' },
  { family: 'Coiny', url: 'https://fonts.gstatic.com/s/coiny/v16/gyByhwU1K989PXwSClOr.woff2', weight: '400' },
  { family: 'Lilita One', url: 'https://fonts.gstatic.com/s/lilitaone/v17/i7dPIFZ9Zz-WBtRtedDbYEF8RQ.woff2', weight: '400' },
  { family: 'Bagel Fat One', url: 'https://fonts.gstatic.com/s/bagelfatone/v4/hYkPPucsQOr5dy02WmQr5JnPYt8.woff2', weight: '400' },
  { family: 'Baloo 2', url: 'https://fonts.gstatic.com/s/baloo2/v23/wXKrE3kTposypRyd11rWB-wq.woff2', weight: '400 800' },
  { family: 'Montserrat', url: 'https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm45xWtrzAbj.woff2', weight: '400 700' },
  { family: 'Nunito', url: 'https://fonts.gstatic.com/s/nunito/v32/XRXV3I6Li01BKof4N-yGbss.woff2', weight: '400 900' },
  { family: 'Luckiest Guy', url: 'https://fonts.gstatic.com/s/luckiestguy/v25/_gP_1RrxsjcxVyin9l9n_j2RT9RxqDs.woff2', weight: '400' },
  { family: 'Orbitron', url: 'https://fonts.gstatic.com/s/orbitron/v35/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgzfDAlp7lk.woff2', weight: '400' },
  { family: 'Audiowide', url: 'https://fonts.gstatic.com/s/audiowide/v22/l7gdbjpo0cum0ckerWCdmA_OMRlABolM.woff2', weight: '400' },
  { family: 'Fredoka', url: 'https://fonts.gstatic.com/s/fredoka/v17/X7nP4b87HvSqjb_WIi2yDCRwoQ_k7367_B-i2yQag0-mac3OFiX8E-mKttxNbiktb9I.woff2', weight: '700' },
  // Local fonts
  { family: 'Ice Kingdom', url: '/fonts/Icekingdom.ttf', weight: '400' },
  { family: 'Spicy Sale', url: '/fonts/SpicySale.ttf', weight: '400' },
  { family: 'Kpop Demon Hunter', url: '/fonts/KpopDemonHunter.ttf', weight: '400' },
]

// Helper function to format date for display
export function formatDate(dateStr) {
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
