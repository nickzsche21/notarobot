import type { Challenge } from "./types";

/**
 * Order matters. The first two feel like a real CAPTCHA, then the floor
 * gives way. The last one is the punchline.
 */
export const CHALLENGES: Challenge[] = [
  {
    id: "checkbox",
    prompt: "Confirm you are not a robot.",
    hint: "Standard verification. This will be quick.",
  },
  {
    id: "grid",
    prompt: "Select all squares containing REGRET.",
    hint: "You know which ones.",
  },
  {
    id: "wobble",
    prompt: "Drag the cursor from A to B.",
    hint: "Do not be precise about it.",
  },
  {
    id: "typing",
    prompt: "Transcribe the phrase below.",
    hint: "Accuracy is not the objective.",
  },
  {
    id: "idle",
    prompt: "Do nothing for seven seconds.",
    hint: "Nothing at all. We are watching how you fail at that.",
  },
  {
    id: "trolley",
    prompt: "The lever is in front of you.",
    hint: "There is no correct answer. There is only how long you take.",
  },
  {
    id: "pain",
    prompt: "Which one hurts more?",
    hint: "Answer honestly. We can tell.",
  },
  {
    id: "final",
    prompt: "Confirm you are a robot.",
    hint: "The form has been corrected. Please comply.",
  },
];
