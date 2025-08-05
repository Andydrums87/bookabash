// constants/inviteConstants.js

export const BIRTHDAY_COLORS = {
    princess: "#FFD700", // Gold
    princess_v2: "#FF69B4", // Hot pink
    superhero_blue: "#00BFFF", // Deep sky blue
    superhero_red: "#FF4500", // Orange red
    dinosaur_v1: "#FFD700", // Yellow/Gold ✨
    safari: "#FFA500", // Orange
    space_v2: "#FFD700", // Gold
    rocket_space: "#FF6347", // Tomato
    pirate: "#DAA520", // Goldenrod
  }
  
  export const THEME_ELEMENTS = {
    princess: "crowns, castles, magic wands, and sparkles",
    princess_v2: "floral crowns, fairy tale elements, and magical sparkles",
    superhero_blue: "city skylines, comic-style rays, and superhero symbols",
    superhero_red: "action bursts, superhero emblems, and dynamic shapes",
    dinosaur: "friendly dinosaurs, prehistoric plants, and volcano silhouettes",
    safari: "jungle animals, safari hats, and tropical leaves",
    space: "rockets, planets, stars, and astronauts",
    pirate: "treasure chests, pirate ships, and tropical islands",
  }
  
  export const HEADLINE_STYLES = {
    default: { fontSize: "38px", lineHeight: "1.2", fontWeight: "700" },
    simple: { fontSize: "32px", lineHeight: "1.1", fontWeight: "600" },
    invite: { fontSize: "30px", lineHeight: "1.3", fontWeight: "600" },
    celebrate: { fontSize: "28px", lineHeight: "1.2", fontWeight: "700" },
    theme: { fontSize: "34px", lineHeight: "1.1", fontWeight: "700", fontStyle: "italic" },
    custom: { fontSize: "32px", lineHeight: "1.2", fontWeight: "600" },
  }
  
  export const THEME_ADJUSTMENTS = {
    space_v2: {
      default: { fontSize: "40px", fontFamily: "'Orbitron', sans-serif" },
      simple: { fontSize: "36px", fontFamily: "'Orbitron', sans-serif" },
      invite: { fontSize: "32px", fontFamily: "'Orbitron', sans-serif" },
      celebrate: { fontSize: "30px", fontFamily: "'Orbitron', sans-serif" },
      theme: { fontSize: "38px", fontFamily: "'Orbitron', sans-serif" },
      custom: { fontSize: "34px", fontFamily: "'Orbitron', sans-serif" },
    },
    rocket_space: {
      default: { fontSize: "40px", fontFamily: "'Orbitron', sans-serif" },
      simple: { fontSize: "36px", fontFamily: "'Orbitron', sans-serif" },
      invite: { fontSize: "32px", fontFamily: "'Orbitron', sans-serif" },
      celebrate: { fontSize: "30px", fontFamily: "'Orbitron', sans-serif" },
      theme: { fontSize: "38px", fontFamily: "'Orbitron', sans-serif" },
      custom: { fontSize: "34px", fontFamily: "'Orbitron', sans-serif" },
    },
    dinosaur_v1: {
      default: { fontSize: "80px", fontFamily: "'Fredoka', sans-serif", lineHeight: "0.8" },
      simple: { fontSize: "72px", fontFamily: "'Fredoka', sans-serif", lineHeight: "0.8" },
      invite: { fontSize: "68px", fontFamily: "'Fredoka', sans-serif", lineHeight: "0.9" },
      celebrate: { fontSize: "64px", fontFamily: "'Fredoka', sans-serif", lineHeight: "0.8" },
      theme: { fontSize: "76px", fontFamily: "'Fredoka', sans-serif", lineHeight: "0.8" },
      custom: { fontSize: "70px", fontFamily: "'Fredoka', sans-serif", lineHeight: "0.8" },
    },
  }
  
  export const GUEST_CONTACT_TYPES = {
    EMAIL: "email",
    PHONE: "phone",
  }
  
  export const GUEST_STATUS = {
    PENDING: "pending",
    SENT: "sent",
  }
  
  export const SAVE_BUTTON_STATES = {
    GENERATING: "generating",
    SAVED: "saved",
    UNSAVED_CHANGES: "unsaved_changes",
    READY_TO_SAVE: "ready_to_save",
  }
  
  export const DEFAULT_INVITE_DATA = {
    childName: "",
    age: "",
    date: "",
    time: "",
    venue: "",
    message: "Join us for an amazing adventure!",
    headline: "default",
  }
  
  export const DEFAULT_GUEST = {
    name: "",
    contact: "",
    type: "email",
  }