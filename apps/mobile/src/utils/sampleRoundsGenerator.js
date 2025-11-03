/**
 * Realistic Sample Golf Rounds Generator
 *
 * Generates complete 18-hole rounds with realistic scoring
 * across all score ranges (70-130+)
 */

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper to generate realistic shot sequences for a hole
const generateHoleShots = (par, targetScore, holeNumber) => {
  const shots = [];
  const shotsNeeded = targetScore;

  // Common clubs for different situations
  const teeClubs = par >= 4 ? ["Driver", "3 Wood"] : ["5 Iron", "6 Iron", "7 Iron"];
  const approachClubs = ["4 Iron", "5 Iron", "6 Iron", "7 Iron", "8 Iron", "9 Iron"];
  const shortGameClubs = ["Pitching Wedge", "Gap Wedge", "Approach Wedge", "Sand Wedge", "Lob Wedge"];

  for (let i = 0; i < shotsNeeded; i++) {
    let club, qualities = [], note = "", quality;

    if (i === 0) {
      // Tee shot
      club = teeClubs[Math.floor(Math.random() * teeClubs.length)];
      if (targetScore > par + 1 && Math.random() > 0.6) {
        qualities = [["slice", "hook", "top"][Math.floor(Math.random() * 3)]];
        note = ["Wayward drive", "Into trouble", "Not the start I wanted"][Math.floor(Math.random() * 3)];
        quality = Math.floor(Math.random() * 4) + 3; // 3-6 (bad drive)
      } else if (Math.random() > 0.7) {
        note = "Solid drive";
        quality = Math.floor(Math.random() * 3) + 7; // 7-9 (good drive)
      } else {
        quality = Math.floor(Math.random() * 3) + 5; // 5-7 (average drive)
      }
    } else if (i === shotsNeeded - 1) {
      // Final putt
      club = "Putter";
      if (targetScore === par - 1) note = "Birdie putt!";
      else if (targetScore === par) note = "For par";
      quality = Math.floor(Math.random() * 3) + 6; // 6-8 (putts are generally good)
    } else if (i === shotsNeeded - 2 && shotsNeeded > 2) {
      // Approach or chip
      if (shotsNeeded <= par + 1) {
        club = approachClubs[Math.floor(Math.random() * approachClubs.length)];
        quality = Math.floor(Math.random() * 4) + 5; // 5-8
      } else {
        club = shortGameClubs[Math.floor(Math.random() * shortGameClubs.length)];
        if (Math.random() > 0.7) {
          qualities = [["chunk", "thin", "fat"][Math.floor(Math.random() * 3)]];
          quality = Math.floor(Math.random() * 3) + 3; // 3-5 (bad short game)
        } else {
          quality = Math.floor(Math.random() * 4) + 5; // 5-8
        }
      }
    } else {
      // Recovery or approach shots
      club = [...approachClubs, ...shortGameClubs][Math.floor(Math.random() * 9)];
      if (Math.random() > 0.8) {
        qualities = [["thin", "fat"][Math.floor(Math.random() * 2)]];
        quality = Math.floor(Math.random() * 3) + 3; // 3-5
      } else {
        quality = Math.floor(Math.random() * 4) + 5; // 5-8
      }
    }

    shots.push({ club, qualities, note, quality });
  }

  return shots;
};

// Newton Commonwealth Golf Course actual data
const NEWTON_COMMONWEALTH = {
  pars: [4, 5, 3, 3, 5, 4, 3, 5, 3, 4, 4, 3, 4, 4, 5, 3, 4, 4], // Par 70
  yardages: [252, 476, 179, 110, 435, 255, 162, 473, 180, 259, 295, 148, 263, 231, 422, 130, 367, 355],
};

// Generate a complete 18-hole round with target score
const generateRound = (courseName, targetScore, daysAgo, tee = "White", useNewtonData = false) => {
  const pars = useNewtonData ? NEWTON_COMMONWEALTH.pars : [4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 5, 4, 4];
  const yardages = useNewtonData ? NEWTON_COMMONWEALTH.yardages : null;
  const totalPar = pars.reduce((a, b) => a + b, 0);

  // Distribute score across holes realistically
  const holes = [];
  let remainingShots = targetScore;

  for (let i = 0; i < 18; i++) {
    const par = pars[i];
    const holesLeft = 18 - i;

    // Calculate shots for this hole (somewhat random but trending toward target)
    let holeScore;
    if (i < 17) {
      const avgRemaining = remainingShots / holesLeft;
      const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
      holeScore = Math.max(par - 1, Math.min(par + 4, Math.round(avgRemaining + variation)));
    } else {
      // Last hole: use whatever's left
      holeScore = remainingShots;
    }

    remainingShots -= holeScore;

    const distance = yardages ? yardages[i] : (
      par === 3 ? 150 + Math.random() * 80 :
      par === 4 ? 350 + Math.random() * 100 :
      500 + Math.random() * 100
    );

    holes.push({
      number: i + 1,
      par,
      distance: yardages ? distance : Math.round(distance),
      shots: generateHoleShots(par, holeScore, i + 1),
    });
  }

  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  return {
    id: generateId(),
    date: date.toISOString(),
    courseId: `course_${courseName.toLowerCase().replace(/\s+/g, '_')}`,
    courseName,
    tee,
    finishedAt: date.toISOString(),
    holes,
  };
};

export const createRealisticSampleRounds = () => {
  return [
    // Recent rounds at Newton Commonwealth (realistic 85-100 range for average golfer)
    generateRound("Newton Commonwealth Golf Course", 92, 2, "White", true),
    generateRound("Newton Commonwealth Golf Course", 88, 7, "White", true),
    generateRound("Newton Commonwealth Golf Course", 96, 14, "White", true),
  ];
};
