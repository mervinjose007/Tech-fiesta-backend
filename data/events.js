// Tech Fiesta 2025 Events
const events = [
  // Technical Events
  {
    id: 1,
    title: "Paper Presentation",
    type: "tech",
    description:
      "Develop feasible solutions to given problems. Present innovative and practical approaches that effectively address requirements and demonstrate technical excellence.",
    tags: ["Presentation", "Innovation", "Research", "Problem Solving"],
    price: "₹99",
    citPrice: "₹59",
    maxTeamSize: 2,
  },
  {
    id: 2,
    title: "Jeopardy-Style CTF",
    type: "tech",
    description:
      "A fast, game-like event where teams solve a set of small technical challenges to uncover hidden 'flags'. Challenges are split into Web, Crypto, and Forensics across easy to medium difficulties. Pick any challenge in any order, and submit the flag to climb the live leaderboard.",
    tags: ["CTF", "Security", "Web", "Crypto", "Forensics", "Competition"],
    price: "₹99",
    citPrice: "₹59",
    maxTeamSize: 3,
  },
  {
    id: 3,
    title: "Tech Survivor",
    type: "tech",
    description:
      "An elimination arena featuring a multi-round competition: tech quiz, logic finding, coding/debugging, and twists like blind coding or silent collaboration. Teams get eliminated each round until only one survives.",
    tags: ["Competition", "Debugging", "Logic", "Coding", "Teamwork"],
    price: "₹99",
    citPrice: "₹59",
    maxTeamSize: 3,
  },
  {
    id: 4,
    title: "LeetCode Speed Relay",
    type: "tech",
    description:
      "A high-pressure coding relay on a single LeetCode problem. Each teammate gets exactly 5 minutes at the keyboard before stopping immediately. No restarting, no handover explanation, and no communication during transitions.",
    tags: ["LeetCode", "Coding", "Relay", "Teamwork", "Speed"],
    price: "₹99",
    citPrice: "₹59",
    maxTeamSize: 4,
  },
  {
    id: 5,
    title: "Hack The Campus",
    type: "tech",
    description:
      "An AR + QR cyber treasure hunt where teams navigate the campus scanning QR codes to solve coding puzzles, encrypted messages, cybersecurity clues, and AR missions to eventually access the Master Server.",
    tags: ["Treasure Hunt", "AR", "QR", "Cybersecurity", "Puzzles"],
    price: "₹99",
    citPrice: "₹59",
    maxTeamSize: 3,
  },
  {
    id: 6,
    title: "Tech Debate",
    type: "tech",
    description:
      "A stage event where participants debate trending and controversial technology topics like AI, cybersecurity, startups, social media, coding culture, and future tech. Focuses on critical thinking, public speaking, and team coordination.",
    tags: ["Debate", "Public Speaking", "Critical Thinking", "Tech Trends"],
    price: "₹99",
    citPrice: "₹59",
    maxTeamSize: 2,
  },

  // Non-Technical Events
  {
    id: 7,
    title: "BGMI",
    type: "non-tech",
    description:
      "Battle it out in the popular mobile game BGMI! Team up, strategize, and compete for victory in an action-packed gaming tournament.",
    tags: ["Gaming", "Teamwork", "Strategy", "Competition"],
    price: "₹79",
  },
  {
    id: 8,
    title: "ADDZAP",
    type: "non-tech",
    description:
      "Unleash your creativity in ADDZAP! Create and present unique advertisements for fun products, showcasing your storytelling and public speaking skills.",
    tags: ["Storytelling", "Creativity", "Public Speaking"],
    price: "₹79",
  },
  {
    id: 9,
    title: "JAM",
    type: "non-tech",
    description:
      "Showcase your spontaneity in Just A Minute (JAM)! Speak on a given topic for one minute without hesitation, repetition, or deviation.",
    tags: ["Public Speaking", "Spontaneity", "Communication", "Fun"],
    price: "₹79",
  },
  // {
  //   id: 10,
  //   title: "CHESS",
  //   type: "non-tech",
  //   description:
  //     "Test your strategic thinking and patience in a classic chess tournament. Compete against fellow participants and prove your mastery of the game.",
  //   tags: ["Strategy", "Board Game", "Competition", "Logic"],
  //   price: "₹79",
  // },
  {
    id: 11,
    title: "Best Photography",
    type: "non-tech",
    description:
      "Capture the essence of the event! Submit your best photographs and compete for the title of Best Photographer, judged on creativity and technique.",
    tags: ["Photography", "Creativity", "Contest", "Art"],
    price: "₹79",
  },
];

// Helper functions
const getTechEvents = () => events.filter((event) => event.type === "tech");
const getNonTechEvents = () =>
  events.filter((event) => event.type === "non-tech");
const getEventById = (id) => events.find((event) => event.id === id);
const getUpcomingEvents = () => {
  const today = new Date();
  return events.filter((event) => new Date(event.date) >= today);
};

module.exports = {
  events,
  getTechEvents,
  getNonTechEvents,
  getEventById,
  getUpcomingEvents,
};
