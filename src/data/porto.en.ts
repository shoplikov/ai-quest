// Porto's lines, by situation. Max 12 words each. Same pools and the same
// number of lines as porto.ru.ts.
export const portoLines = {
  firstVisit: [
    "Hi! I'm Porto. I know where every port goes.",
    'Hello, hero. I brought a lantern. Networks are dark sometimes.',
    'Welcome! We go one level at a time. No rush.',
    "Hi! I'm an otter with a lantern. Ask me about doors.",
    'Hello! Getting stuck is part of the map. I checked.',
    "Welcome aboard. The terminal is quiet, not angry. You'll see.",
  ],
  returning: [
    'Welcome back! The map kept your place.',
    'Hello again! Your progress waited right here, safe and sound.',
    "There you are! I kept the lantern lit.",
    'Welcome back. Pick up exactly where you left off.',
    'Good to see you. One small step today is plenty.',
    "Back again! The ports missed you. Well, I did.",
  ],
  midLevel: [
    "One mission at a time. That's the whole trick.",
    'Read the error out loud. It usually tells the truth.',
    'Stuck for 30 minutes? Write it down, then ask.',
    'Every engineer has lost an hour to a wrong port.',
    'Breaking it on purpose is still progress. Promise.',
    'Check the address, then the port, then the path.',
  ],
  levelDone: [
    'You did that. Nobody did it for you.',
    'Level done! That knowledge is yours to keep now.',
    'Look at you, finishing things. That is the job.',
    "Badge earned. I'm holding my lantern extra high.",
    'Another hop understood. The next one will feel easier.',
    'Done and dusted. Take a breath before the next one.',
  ],
  allDone: [
    'The whole map! From terminal to production. Wow.',
    'You crossed every level. I am one proud otter.',
    'Quest complete. You shipped a real service. Remember this.',
    'All lanterns lit. Time for a real task with your name.',
    'From a black window to a deployed service. All you.',
    'You finished. The map was practice; now it is yours.',
  ],
  quizMiss: [
    'Good guess! This one tricks everybody.',
    'Close! Read the why — it sticks better after a miss.',
    'Not this time. The error message is a sneaky one.',
    'Wrong answers are free here. Try the next one.',
    'Almost. Even seniors pause on this one.',
    "That's how you learn it for good. On we go!",
  ],
  quizHit: [
    'Yes! You read that error like a pro.',
    'Correct! That lantern is shining right on it.',
    'Spot on. You did not even need to search.',
    'Right! That one used to confuse everyone. Not you.',
    'Exactly. Your future self thanks you.',
    'Nailed it. Next question!',
  ],
} as const;

export type PortoPool = keyof typeof portoLines;
