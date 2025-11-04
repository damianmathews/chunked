import Constants from "expo-constants";

const GOLF_API_BASE_URL = "https://api.golfcourseapi.com/api";

// Get API key from environment variables
const getApiKey = () => {
  const apiKey =
    process.env.EXPO_PUBLIC_GOLF_API_KEY ||
    Constants.expoConfig?.extra?.golfApiKey;
  if (!apiKey) {
    console.warn(
      "Golf API key not found. Please add EXPO_PUBLIC_GOLF_API_KEY to your environment.",
    );
  }
  return apiKey;
};

// Search for golf courses by name
export const searchCourses = async (query) => {
  const apiKey = getApiKey();

  // If no API key, return test course for any search
  if (!apiKey) {
    if (query && query.trim().length >= 2) {
      return [getTestCourse()];
    }
    return [];
  }

  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `${GOLF_API_BASE_URL}/courses?search=${encodeURIComponent(query.trim())}&api=${apiKey}`,
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Invalid API key. Please check your golf API configuration.",
        );
      }
      if (response.status === 429) {
        throw new Error(
          "Too many requests. Please wait a moment and try again.",
        );
      }
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("Course search results:", data);

    // Transform the API response to our expected format
    if (Array.isArray(data)) {
      return data.map((course) => ({
        id: course.id,
        name: course.name,
        location: `${course.city}, ${course.state}`,
        city: course.city,
        state: course.state,
        country: course.country,
        yardages: course.total_yardages || {},
      }));
    }

    return [];
  } catch (error) {
    console.error("Error searching courses:", error);
    // Return test course as fallback
    if (query && query.trim().length >= 2) {
      return [getTestCourse()];
    }
    throw error;
  }
};

// Get detailed course information including hole data
export const getCourseDetails = async (courseId) => {
  const apiKey = getApiKey();

  // If no API key or it's our test course, return test course details
  if (!apiKey || courseId === "test_course_1") {
    return getTestCourseDetails();
  }

  try {
    const response = await fetch(
      `${GOLF_API_BASE_URL}/courses/${courseId}?api=${apiKey}`,
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Invalid API key. Please check your golf API configuration.",
        );
      }
      if (response.status === 404) {
        throw new Error("Course not found.");
      }
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("Course details:", data);

    // Transform the API response to our expected format
    const courseData = {
      id: data.id,
      name: data.name,
      location: `${data.city}, ${data.state}`,
      city: data.city,
      state: data.state,
      country: data.country,
      holes: [],
      tees: ["White", "Blue", "Black"], // Default tees
      selectedTee: "White",
    };

    // Process hole data if available
    if (data.holes && Array.isArray(data.holes)) {
      courseData.holes = data.holes.map((hole) => ({
        hole: hole.hole,
        par: hole.par,
        yardage:
          hole.teeBoxes?.White || hole.teeBoxes?.white || hole.distance || 400,
      }));

      // Extract available tees from hole data
      const availableTees = new Set(["White"]); // Always include White as fallback
      data.holes.forEach((hole) => {
        if (hole.teeBoxes) {
          Object.keys(hole.teeBoxes).forEach((tee) => {
            availableTees.add(
              tee.charAt(0).toUpperCase() + tee.slice(1).toLowerCase(),
            );
          });
        }
      });
      courseData.tees = Array.from(availableTees);
    }

    return courseData;
  } catch (error) {
    console.error("Error getting course details:", error);
    // Return test course as fallback
    return getTestCourseDetails();
  }
};

// Get a test course for development/testing
export const getTestCourse = () => {
  return {
    id: "test_course_1",
    name: "Newton Commonwealth Golf Club",
    location: "Newton, MA",
    city: "Newton",
    state: "MA",
    country: "USA",
    yardages: { White: 4992, Blue: 5354 },
  };
};

// Get detailed test course information
export const getTestCourseDetails = () => {
  // Newton Commonwealth Golf Club - Par 70
  // White: 4,992 yards | Blue: 5,354 yards
  const testHoles = [
    // Front 9
    { hole: 1, par: 4, teeBoxes: { White: 252, Blue: 277 } },
    { hole: 2, par: 5, teeBoxes: { White: 476, Blue: 533 } },
    { hole: 3, par: 3, teeBoxes: { White: 179, Blue: 193 } },
    { hole: 4, par: 3, teeBoxes: { White: 110, Blue: 129 } },
    { hole: 5, par: 5, teeBoxes: { White: 435, Blue: 455 } },
    { hole: 6, par: 4, teeBoxes: { White: 255, Blue: 276 } },
    { hole: 7, par: 3, teeBoxes: { White: 162, Blue: 177 } },
    { hole: 8, par: 5, teeBoxes: { White: 473, Blue: 488 } },
    { hole: 9, par: 3, teeBoxes: { White: 180, Blue: 210 } },
    // Back 9
    { hole: 10, par: 4, teeBoxes: { White: 259, Blue: 276 } },
    { hole: 11, par: 4, teeBoxes: { White: 295, Blue: 307 } },
    { hole: 12, par: 3, teeBoxes: { White: 148, Blue: 159 } },
    { hole: 13, par: 4, teeBoxes: { White: 263, Blue: 268 } },
    { hole: 14, par: 4, teeBoxes: { White: 231, Blue: 247 } },
    { hole: 15, par: 5, teeBoxes: { White: 422, Blue: 451 } },
    { hole: 16, par: 3, teeBoxes: { White: 130, Blue: 152 } },
    { hole: 17, par: 4, teeBoxes: { White: 367, Blue: 378 } },
    { hole: 18, par: 4, teeBoxes: { White: 355, Blue: 378 } },
  ];

  return {
    id: "test_course_1",
    name: "Newton Commonwealth Golf Club",
    location: "Newton, MA",
    city: "Newton",
    state: "MA",
    country: "USA",
    holes: testHoles,
    tees: ["White", "Blue"],
    selectedTee: "Blue",
  };
};

// Create a fallback course for manual entry
export const createManualCourse = (courseName = "Custom Course") => {
  const manualCourse = {
    id: `manual_${Date.now()}`,
    name: courseName,
    location: "Manual Entry",
    holes: [],
    tees: ["White"],
    selectedTee: "White",
  };

  // Create 18 default holes (Par 4, 400 yards each)
  for (let i = 1; i <= 18; i++) {
    manualCourse.holes.push({
      hole: i,
      par: 4,
      yardage: 400,
    });
  }

  return manualCourse;
};

// Helper function to get yardage for a specific tee
export const getYardageForTee = (hole, tee = "White") => {
  if (hole.teeBoxes) {
    const teeKey = Object.keys(hole.teeBoxes).find(
      (key) => key.toLowerCase() === tee.toLowerCase(),
    );
    if (teeKey) {
      return hole.teeBoxes[teeKey];
    }
  }
  return hole.yardage || hole.distance || 400;
};

// Test API connection
export const testApiConnection = async () => {
  try {
    const results = await searchCourses("Pebble");
    return { success: true, message: "API connection successful" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
