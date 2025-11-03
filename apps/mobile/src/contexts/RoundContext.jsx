import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createRealisticSampleRounds } from "@/utils/sampleRoundsGenerator";

const RoundContext = createContext();

export const useRound = () => {
  const context = useContext(RoundContext);
  if (!context) {
    throw new Error("useRound must be used within a RoundProvider");
  }
  return context;
};

// Golf clubs and shot qualities constants
export const CLUBS = [
  "Driver",
  "3 Wood",
  "5 Wood",
  "Hybrid",
  "3 Iron",
  "4 Iron",
  "5 Iron",
  "6 Iron",
  "7 Iron",
  "8 Iron",
  "9 Iron",
  "Pitching Wedge",
  "Gap Wedge",
  "Approach Wedge",
  "Sand Wedge",
  "Lob Wedge",
  "Putter",
];

export const SHOT_QUALITIES = {
  chunk: "Hit behind the ball, dug up a divot—short and fat shot.",
  top: "Skulled the top of the ball—low pop-up, no distance.",
  slice: "Curved hard right (for right-handers)—fades into trouble.",
  hook: "Curved hard left (for right-handers)—pulls off line.",
  fat: "Hit ground before ball—lost power, chunked it.",
  thin: "Scooped under ball—low runner, no height.",
  skull: "Nicked the ball with club's leading edge—cranky mishit.",
  pull: "Started left and stayed left—straight but offline.",
  push: "Started right and stayed right—straight but offline.",
  other: "Something else weird—add a note.",
};

// Action types
const ROUND_ACTIONS = {
  START_ROUND: "START_ROUND",
  ADD_SHOT: "ADD_SHOT",
  FINISH_ROUND: "FINISH_ROUND",
  LOAD_ROUNDS: "LOAD_ROUNDS",
  DELETE_ROUND: "DELETE_ROUND",
  RESET_CURRENT_ROUND: "RESET_CURRENT_ROUND",
};

// Initial state
const initialState = {
  currentRound: null,
  pastRounds: [],
  isLoading: false,
  hasConsentedToDataCollection: false,
};

// Reducer
const roundReducer = (state, action) => {
  switch (action.type) {
    case ROUND_ACTIONS.START_ROUND:
      return {
        ...state,
        currentRound: action.payload,
      };

    case ROUND_ACTIONS.ADD_SHOT:
      if (!state.currentRound) return state;

      const updatedHoles = state.currentRound.holes.map((hole) => {
        if (hole.number === action.payload.holeNumber) {
          return {
            ...hole,
            shots: [...hole.shots, action.payload.shot],
          };
        }
        return hole;
      });

      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          holes: updatedHoles,
        },
      };

    case ROUND_ACTIONS.FINISH_ROUND:
      return {
        ...state,
        pastRounds: [action.payload, ...state.pastRounds],
        currentRound: null,
      };

    case ROUND_ACTIONS.LOAD_ROUNDS:
      return {
        ...state,
        pastRounds: action.payload.rounds || action.payload,
        hasConsentedToDataCollection: action.payload.hasConsented || false,
        isLoading: false,
      };

    case ROUND_ACTIONS.DELETE_ROUND:
      return {
        ...state,
        pastRounds: state.pastRounds.filter(
          (round) => round.id !== action.payload,
        ),
      };

    case ROUND_ACTIONS.RESET_CURRENT_ROUND:
      return {
        ...state,
        currentRound: null,
      };

    case "SET_DATA_CONSENT":
      return {
        ...state,
        hasConsentedToDataCollection: action.payload,
      };

    default:
      return state;
  }
};

// Helper functions
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Newton Commonwealth Golf Course - White Tees
const NEWTON_COMMONWEALTH_COURSE = {
  id: "newton_commonwealth",
  name: "Newton Commonwealth Golf Course",
  holes: [
    { hole: 1, par: 4, yardage: 252 },
    { hole: 2, par: 5, yardage: 476 },
    { hole: 3, par: 3, yardage: 179 },
    { hole: 4, par: 3, yardage: 110 },
    { hole: 5, par: 5, yardage: 435 },
    { hole: 6, par: 4, yardage: 255 },
    { hole: 7, par: 3, yardage: 162 },
    { hole: 8, par: 5, yardage: 473 },
    { hole: 9, par: 3, yardage: 180 },
    { hole: 10, par: 4, yardage: 259 },
    { hole: 11, par: 4, yardage: 295 },
    { hole: 12, par: 3, yardage: 148 },
    { hole: 13, par: 4, yardage: 263 },
    { hole: 14, par: 4, yardage: 231 },
    { hole: 15, par: 5, yardage: 422 },
    { hole: 16, par: 3, yardage: 130 },
    { hole: 17, par: 4, yardage: 367 },
    { hole: 18, par: 4, yardage: 355 },
  ],
};

const createDefaultHoles = (courseHoles = []) => {
  const holes = [];
  for (let i = 1; i <= 18; i++) {
    const courseHole = courseHoles.find((h) => h.hole === i);
    holes.push({
      number: i,
      par: courseHole?.par || 4,
      distance: courseHole?.yardage || 400,
      shots: [],
    });
  }
  return holes;
};

// Now using createRealisticSampleRounds() imported from sampleRoundsGenerator.js

// Export for use elsewhere
export { NEWTON_COMMONWEALTH_COURSE };

export const RoundProvider = ({ children }) => {
  const [state, dispatch] = useReducer(roundReducer, initialState);

  // Load saved rounds on mount
  useEffect(() => {
    loadRounds();
  }, []);

  // Save rounds to AsyncStorage whenever pastRounds changes
  useEffect(() => {
    if (state.pastRounds.length > 0) {
      saveRounds(state.pastRounds);
    }
  }, [state.pastRounds]);

  // Save current round to AsyncStorage whenever it changes
  useEffect(() => {
    if (state.currentRound) {
      saveCurrentRound(state.currentRound);
    }
  }, [state.currentRound]);

  const loadRounds = async () => {
    try {
      const savedRounds = await AsyncStorage.getItem("golf_rounds");
      const savedCurrentRound =
        await AsyncStorage.getItem("current_golf_round");
      const savedConsent = await AsyncStorage.getItem("data_consent");

      let rounds = [];
      let hasConsented = false;

      if (savedConsent !== null) {
        hasConsented = JSON.parse(savedConsent);
      }

      if (savedRounds) {
        rounds = JSON.parse(savedRounds);
      } else if (hasConsented) {
        // Only load sample data if user has consented
        rounds = createRealisticSampleRounds();
        await saveRounds(rounds);
      }

      dispatch({
        type: ROUND_ACTIONS.LOAD_ROUNDS,
        payload: { rounds, hasConsented },
      });

      if (savedCurrentRound && hasConsented) {
        const currentRound = JSON.parse(savedCurrentRound);
        dispatch({ type: ROUND_ACTIONS.START_ROUND, payload: currentRound });
      }
    } catch (error) {
      console.error("Error loading rounds:", error);
      dispatch({
        type: ROUND_ACTIONS.LOAD_ROUNDS,
        payload: { rounds: [], hasConsented: false },
      });
    }
  };

  const saveRounds = async (rounds) => {
    try {
      await AsyncStorage.setItem("golf_rounds", JSON.stringify(rounds));
    } catch (error) {
      console.error("Error saving rounds:", error);
    }
  };

  const saveCurrentRound = async (round) => {
    try {
      await AsyncStorage.setItem("current_golf_round", JSON.stringify(round));
    } catch (error) {
      console.error("Error saving current round:", error);
    }
  };

  const clearCurrentRound = async () => {
    try {
      await AsyncStorage.removeItem("current_golf_round");
    } catch (error) {
      console.error("Error clearing current round:", error);
    }
  };

  const startRound = (courseData, tee = "White") => {
    const round = {
      id: generateId(),
      date: new Date().toISOString(),
      courseId: courseData.id,
      courseName: courseData.name,
      tee: tee,
      holes: createDefaultHoles(courseData.holes || []),
    };

    dispatch({ type: ROUND_ACTIONS.START_ROUND, payload: round });
    console.log("Started new round:", round);
  };

  const addShot = (holeNumber, club, qualities = [], note = "", quality = 5) => {
    const shot = {
      club,
      qualities,
      note: note.trim(),
      quality, // 1-10 scale
    };

    dispatch({
      type: ROUND_ACTIONS.ADD_SHOT,
      payload: { holeNumber, shot },
    });

    console.log(`Added shot to hole ${holeNumber}:`, shot);
  };

  const finishRound = async () => {
    if (!state.currentRound) return;

    const finishedRound = {
      ...state.currentRound,
      finishedAt: new Date().toISOString(),
    };

    dispatch({ type: ROUND_ACTIONS.FINISH_ROUND, payload: finishedRound });
    await clearCurrentRound();

    console.log("Finished round:", finishedRound);
  };

  const deleteRound = async (roundId) => {
    dispatch({ type: ROUND_ACTIONS.DELETE_ROUND, payload: roundId });
    console.log("Deleted round:", roundId);
  };

  const resetCurrentRound = async () => {
    dispatch({ type: ROUND_ACTIONS.RESET_CURRENT_ROUND });
    await clearCurrentRound();
  };

  const getTotalShots = (round) => {
    return round.holes.reduce((total, hole) => total + hole.shots.length, 0);
  };

  const getHoleScore = (hole) => {
    const shots = hole.shots.length;
    const par = hole.par;

    if (shots === 0) return "Not played";
    if (shots === 1) return "Hole in one!";
    if (shots === par - 2) return "Eagle";
    if (shots === par - 1) return "Birdie";
    if (shots === par) return "Par";
    if (shots === par + 1) return "Bogey";
    if (shots === par + 2) return "Double bogey";
    if (shots === par + 3) return "Triple bogey";
    return `+${shots - par}`;
  };

  const setDataConsent = async (hasConsented) => {
    try {
      await AsyncStorage.setItem("data_consent", JSON.stringify(hasConsented));
      dispatch({ type: "SET_DATA_CONSENT", payload: hasConsented });

      if (hasConsented && state.pastRounds.length === 0) {
        // Load sample data when user first consents
        const sampleRounds = createRealisticSampleRounds();
        dispatch({
          type: ROUND_ACTIONS.LOAD_ROUNDS,
          payload: { rounds: sampleRounds, hasConsented },
        });
        await saveRounds(sampleRounds);
      }
    } catch (error) {
      console.error("Error saving data consent:", error);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        "golf_rounds",
        "current_golf_round",
        "theme_preference",
        "data_consent",
      ]);

      dispatch({ type: ROUND_ACTIONS.RESET_CURRENT_ROUND });
      dispatch({
        type: ROUND_ACTIONS.LOAD_ROUNDS,
        payload: { rounds: [], hasConsented: false },
      });

      console.log("All data cleared successfully");
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  };

  const value = {
    ...state,
    startRound,
    addShot,
    finishRound,
    deleteRound,
    resetCurrentRound,
    getTotalShots,
    getHoleScore,
    setDataConsent,
    clearAllData,
    CLUBS,
    SHOT_QUALITIES,
  };

  return (
    <RoundContext.Provider value={value}>{children}</RoundContext.Provider>
  );
};
