import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Search,
  MapPin,
  Calendar,
  ChevronDown,
  Play,
  Plus,
  X,
} from "lucide-react-native";
import { Calendar as RNCalendar } from "react-native-calendars";
import { useTheme } from "@/contexts/ThemeContext";
import { useRound } from "@/contexts/RoundContext";
import {
  searchCourses,
  getCourseDetails,
  createManualCourse,
} from "@/services/golfApi";
import * as Haptics from "expo-haptics";

export default function NewRoundScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { startRound, currentRound } = useRound();

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTee, setSelectedTee] = useState("White");
  const [showTeeSelector, setShowTeeSelector] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [roundDate, setRoundDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchText.trim().length >= 2) {
        await handleSearch(searchText);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSearch = async (query) => {
    setIsSearching(true);
    try {
      const results = await searchCourses(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Search Error", error.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCourseSelect = async (course) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoadingCourse(true);
    try {
      const courseDetails = await getCourseDetails(course.id);
      setSelectedCourse(courseDetails);
      setSelectedTee(courseDetails.selectedTee || "White");
      setSearchResults([]);
      setSearchText(course.name);
    } catch (error) {
      console.error("Course details error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Course Not Found",
        `${error.message}\n\nWould you like to add this course manually?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Manually",
            onPress: () => handleManualEntry(course.name),
          },
        ],
      );
    } finally {
      setIsLoadingCourse(false);
    }
  };

  const handleManualEntry = (courseName = "") => {
    Haptics.selectionAsync();
    const manualCourse = createManualCourse(courseName || "Custom Course");
    setSelectedCourse(manualCourse);
    setSelectedTee("White");
    setSearchText(manualCourse.name);
  };

  const handleStartRound = () => {
    if (!selectedCourse) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Course Required", "Select a course to start tracking.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    startRound(selectedCourse, selectedTee, roundDate);
    router.push("/round-logger");
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const handleDateSelect = (day) => {
    // Parse date string to avoid timezone offset issues
    const [year, month, dayNum] = day.dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, dayNum, 12, 0, 0); // Noon local time
    setRoundDate(localDate);
    setShowDatePicker(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBarStyle} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: theme.colors.text,
              marginBottom: 8,
            }}
          >
            New Round
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.textSecondary,
            }}
          >
            Track your round. Analyze your game.
          </Text>
        </View>

        {/* Date Selection */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: theme.colors.text,
              marginBottom: 12,
            }}
          >
            Date
          </Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setShowDatePicker(true);
            }}
            style={{
              backgroundColor: theme.colors.glass,
              borderRadius: theme.glass.cornerRadius,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 2,
            }}
            activeOpacity={0.8}
          >
            <Calendar size={20} color={theme.colors.textSecondary} />
            <Text
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: theme.colors.text,
                fontWeight: theme.typography.weights.body,
              }}
            >
              {formatDate(roundDate)}
            </Text>
            <ChevronDown size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Course Search */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: theme.typography.weights.title,
              color: theme.colors.text,
              marginBottom: 12,
            }}
          >
            Course
          </Text>

          <View
            style={{
              backgroundColor: theme.colors.glass,
              borderRadius: theme.glass.cornerRadius,
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 16,
              paddingRight: 16,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: theme.colors.text,
                paddingVertical: 12,
              }}
              placeholder="Search courses..."
              placeholderTextColor={theme.colors.placeholder}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="words"
              onFocus={() => Haptics.selectionAsync()}
            />
            {isSearching && (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            )}
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View
              style={{
                backgroundColor: theme.colors.glassThick,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.glass.cornerRadius,
                marginTop: 8,
                maxHeight: 200,
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {searchResults.map((course, index) => (
                  <TouchableOpacity
                    key={course.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      handleCourseSelect(course);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 16,
                      borderBottomWidth:
                        index < searchResults.length - 1 ? 1 : 0,
                      borderBottomColor: theme.colors.borderLight,
                    }}
                    activeOpacity={0.7}
                  >
                    <MapPin size={16} color={theme.colors.textSecondary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: theme.typography.weights.label,
                          color: theme.colors.text,
                        }}
                      >
                        {course.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {course.location}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Manual Entry Option */}
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              handleManualEntry();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.glass,
              borderRadius: theme.glass.cornerRadius,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingVertical: 12,
              marginTop: 12,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.5,
              shadowRadius: 2,
              elevation: 1,
            }}
            activeOpacity={0.7}
          >
            <Plus size={16} color={theme.colors.primary} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: theme.typography.weights.label,
                color: theme.colors.primary,
                marginLeft: 8,
              }}
            >
              Add course manually
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tee Selection */}
        {selectedCourse && (
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: theme.typography.weights.title,
                color: theme.colors.text,
                marginBottom: 12,
              }}
            >
              Tees
            </Text>

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setShowTeeSelector(true);
              }}
              style={{
                backgroundColor: theme.colors.glass,
                borderRadius: theme.glass.cornerRadius,
                borderWidth: 1,
                borderColor: theme.colors.border,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 16,
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                elevation: 2,
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: theme.colors.text,
                  fontWeight: theme.typography.weights.body,
                }}
              >
                {selectedTee}
              </Text>
              <ChevronDown size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Start Round Button */}
        {selectedCourse && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleStartRound();
            }}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.glass.cornerRadius,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 18,
              marginBottom: 32,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 8,
              elevation: 6,
            }}
            activeOpacity={0.9}
          >
            <Play size={20} color="#FFFFFF" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: theme.typography.weights.title,
                color: "#FFFFFF",
                marginLeft: 8,
              }}
            >
              Start Round
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.glassThick,
              borderTopLeftRadius: theme.glass.cornerRadius,
              borderTopRightRadius: theme.glass.cornerRadius,
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: theme.colors.border,
              paddingTop: 20,
              paddingBottom: insets.bottom + 20,
              shadowColor: theme.colors.shadowHeavy,
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 1,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 24,
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowDatePicker(false);
                }}
              >
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: theme.typography.weights.title,
                  color: theme.colors.text,
                }}
              >
                Select Date
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <RNCalendar
              style={{
                backgroundColor: "transparent",
                paddingHorizontal: 24,
              }}
              current={roundDate.toISOString().split("T")[0]}
              onDayPress={handleDateSelect}
              markedDates={{
                [roundDate.toISOString().split("T")[0]]: {
                  selected: true,
                  selectedColor: theme.colors.primary,
                },
              }}
              theme={{
                backgroundColor: "transparent",
                calendarBackground: "transparent",
                textSectionTitleColor: theme.colors.textSecondary,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: "#FFFFFF",
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.text,
                textDisabledColor: theme.colors.textTertiary,
                dotColor: theme.colors.primary,
                selectedDotColor: "#FFFFFF",
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.text,
                indicatorColor: theme.colors.primary,
                textDayFontWeight: theme.typography.weights.body,
                textMonthFontWeight: theme.typography.weights.title,
                textDayHeaderFontWeight: theme.typography.weights.label,
                textMonthFontSize: 18,
                textDayFontSize: 16,
                textDayHeaderFontSize: 14,
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Tee Selector Modal */}
      <Modal
        visible={showTeeSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTeeSelector(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.glassThick,
              borderTopLeftRadius: theme.glass.cornerRadius,
              borderTopRightRadius: theme.glass.cornerRadius,
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: theme.colors.border,
              paddingTop: 20,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: 24,
              shadowColor: theme.colors.shadowHeavy,
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 1,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: theme.typography.weights.title,
                color: theme.colors.text,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Select Tees
            </Text>

            {selectedCourse?.tees?.map((tee) => (
              <TouchableOpacity
                key={tee}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedTee(tee);
                  setShowTeeSelector(false);
                }}
                style={{
                  backgroundColor:
                    selectedTee === tee
                      ? theme.colors.primary
                      : theme.colors.glass,
                  borderRadius: theme.glass.cornerRadius,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor:
                    selectedTee === tee
                      ? theme.colors.primary
                      : theme.colors.border,
                  shadowColor: theme.colors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: selectedTee === tee ? 1 : 0.5,
                  shadowRadius: 4,
                  elevation: selectedTee === tee ? 4 : 2,
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: theme.typography.weights.label,
                    color: selectedTee === tee ? "#FFFFFF" : theme.colors.text,
                    textAlign: "center",
                  }}
                >
                  {tee}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowTeeSelector(false);
              }}
              style={{
                backgroundColor: theme.colors.glass,
                borderRadius: theme.glass.cornerRadius,
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingVertical: 16,
                marginTop: 8,
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                elevation: 2,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: theme.typography.weights.label,
                  color: theme.colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
