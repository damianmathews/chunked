import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Info,
  Check,
  Flag,
  Target,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useRound } from "@/contexts/RoundContext";
import { ThemedModal } from "@/components/ThemedModal";
import * as Haptics from "expo-haptics";

export default function RoundLoggerScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const {
    currentRound,
    addShot,
    finishRound,
    getHoleScore,
    CLUBS,
    SHOT_QUALITIES,
  } = useRound();

  const [selectedHole, setSelectedHole] = useState(null);
  const [showShotModal, setShowShotModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState("");
  const [selectedQualities, setSelectedQualities] = useState([]);
  const [shotNote, setShotNote] = useState("");
  const [shotQuality, setShotQuality] = useState(5); // 1-10 scale, default 5
  const [showQualityTooltip, setShowQualityTooltip] = useState(null);
  const [showShotLoggedModal, setShowShotLoggedModal] = useState(false);
  const [shotLoggedMessage, setShotLoggedMessage] = useState("");
  const [showFinishRoundModal, setShowFinishRoundModal] = useState(false);
  const [showNoShotsWarning, setShowNoShotsWarning] = useState(false);
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);
  const [showSelectClubModal, setShowSelectClubModal] = useState(false);
  const [finishRoundMessage, setFinishRoundMessage] = useState("");
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Track recent shot patterns for soulful messages
  const getRecentShots = () => {
    if (!currentRound) return [];
    const recentShots = [];
    currentRound.holes.forEach((hole) => {
      hole.shots.forEach((shot) => {
        recentShots.push(shot);
      });
    });
    return recentShots.slice(-10); // Last 10 shots
  };

  const generateSoulfulMessage = (hole, newShotCount, qualities) => {
    const recentShots = getRecentShots();
    const recentQualities = recentShots.flatMap((shot) => shot.qualities);

    // Count recent patterns
    const recentSlices = recentQualities.filter((q) => q === "slice").length;
    const recentChunks = recentQualities.filter((q) => q === "chunk").length;

    if (qualities.includes("slice") && recentSlices >= 2) {
      return "Pattern detected. Adjust grip or setup.";
    }

    if (qualities.includes("chunk") && recentChunks >= 2) {
      return "Focus on ball-first contact.";
    }

    // Clean shots
    if (qualities.length === 0 && newShotCount <= hole.par) {
      return "Solid contact. Good execution.";
    }

    // Score-based feedback
    if (newShotCount === hole.par - 1) {
      return "Birdie. Well played.";
    }

    if (newShotCount === hole.par) {
      return "Par. Target achieved.";
    }

    if (newShotCount === hole.par + 1) {
      return "Bogey. Still in play.";
    }

    if (newShotCount > hole.par + 2) {
      return "Multiple shots. Analyze and adjust.";
    }

    // Default
    return "Shot logged. Keep tracking.";
  };

  if (!currentRound) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        <Target
          size={64}
          color={theme.colors.textTertiary}
          style={{ marginBottom: 24 }}
        />
        <Text
          style={{
            fontSize: 20,
            fontWeight: theme.typography.weights.title,
            color: theme.colors.text,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          No Round in Progress
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Start a new round to begin logging your shots
        </Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(tabs)/new-round");
          }}
          style={{
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: theme.glass.cornerRadius,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontWeight: theme.typography.weights.title,
              fontSize: 16,
            }}
          >
            Start New Round
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleOpenShotModal = (hole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedHole(hole);
    setSelectedClub("");
    setSelectedQualities([]);
    setShotNote("");
    setShotQuality(5);
    setShowShotModal(true);
  };

  const handleSaveShot = () => {
    if (!selectedClub) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setShowSelectClubModal(true);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addShot(selectedHole.number, selectedClub, selectedQualities, shotNote, shotQuality);

    // Get the updated hole - addShot has already added the shot, so shots.length is the correct count
    const updatedHole = currentRound.holes.find(
      (h) => h.number === selectedHole.number,
    );
    const newShotCount = updatedHole.shots.length; // This is the correct count after addShot()

    // Generate soulful message
    const message = generateSoulfulMessage(
      updatedHole,
      newShotCount,
      selectedQualities,
    );

    // Show themed modal with options to continue or finish
    setShotLoggedMessage(message);
    setShowShotLoggedModal(true);
  };

  const handleFinishRound = () => {
    const playedHoles = currentRound.holes.filter(
      (hole) => hole.shots.length > 0,
    );

    if (playedHoles.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setShowNoShotsWarning(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFinishRoundMessage(`You've logged shots for ${playedHoles.length} hole(s). Finish and save this round?`);
    setShowFinishRoundModal(true);
  };

  const confirmFinishRound = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await finishRound();
    router.push("/(tabs)/journal");
  };

  const toggleQuality = (quality) => {
    Haptics.selectionAsync();
    if (selectedQualities.includes(quality)) {
      setSelectedQualities(selectedQualities.filter((q) => q !== quality));
    } else if (selectedQualities.length < 3) {
      setSelectedQualities([...selectedQualities, quality]);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setShowLimitReachedModal(true);
    }
  };

  const getScoreColor = (hole) => {
    const shots = hole.shots.length;
    const par = hole.par;

    if (shots === 0) return theme.colors.textSecondary;
    if (shots <= par) return theme.colors.scoreGood;
    if (shots === par + 1) return theme.colors.scoreOkay;
    return theme.colors.scoreBad;
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: theme.motion.durations.enter,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: theme.motion.durations.exit,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBarStyle} />

      {/* Header with Liquid Glass effect */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: 20,
          backgroundColor: theme.colors.glassThick,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.glass,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <ArrowLeft size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: theme.typography.weights.title,
                color: theme.colors.text,
              }}
            >
              {currentRound.courseName}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
              }}
            >
              {currentRound.tee} Tees •{" "}
              {new Date(currentRound.date).toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleFinishRound}
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: theme.glass.cornerRadius,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: theme.typography.weights.title,
                color: "#FFFFFF",
              }}
            >
              Finish
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Holes List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {currentRound.holes.map((hole, index) => (
          <TouchableOpacity
            key={hole.number}
            onPress={() => handleOpenShotModal(hole)}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push({
                pathname: "/hole-detail",
                params: {
                  holeNumber: hole.number,
                  isCurrentRound: "true",
                },
              });
            }}
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderWidth: 1,
              borderColor: theme.colors.cardBorder,
              borderRadius: 16,
              padding: 20,
              marginBottom: index === currentRound.holes.length - 1 ? 0 : 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            activeOpacity={0.7}
          >
            {/* Hole Info */}
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Flag size={16} color={theme.colors.primary} />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: theme.colors.text,
                    marginLeft: 8,
                  }}
                >
                  Hole {hole.number}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Par {hole.par} • {hole.distance} yards
              </Text>

              {hole.shots.length > 0 && (
                <Text
                  style={{
                    fontSize: 12,
                    color: getScoreColor(hole),
                    fontWeight: "500",
                  }}
                >
                  {getHoleScore(hole)}
                </Text>
              )}
            </View>

            {/* Shot Count */}
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor:
                    hole.shots.length > 0
                      ? theme.colors.primary
                      : theme.colors.surfaceElevated,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                {hole.shots.length > 0 ? (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    {hole.shots.length}
                  </Text>
                ) : (
                  <Plus size={20} color={theme.colors.textSecondary} />
                )}
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: theme.colors.textSecondary,
                  textAlign: "center",
                }}
              >
                {hole.shots.length === 0 ? "Add Shot" : "Shots"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Shot Logging Modal */}
      <Modal
        visible={showShotModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowShotModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <StatusBar style={theme.colors.statusBarStyle} />

          {/* Modal Header with Liquid Glass */}
          <View
            style={{
              paddingTop: insets.top + 20,
              paddingHorizontal: 24,
              paddingBottom: 20,
              backgroundColor: theme.colors.glassThick,
              borderBottomWidth: theme.glass.strokeOpacity > 0 ? 1 : 0,
              borderBottomColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowShotModal(false);
                }}
                style={{
                  paddingVertical: 8,
                  paddingLeft: 0,
                  paddingRight: 16,
                }}
              >
                <Text
                  style={{ fontSize: 16, color: theme.colors.textSecondary }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: theme.typography.weights.title,
                    color: theme.colors.text,
                  }}
                >
                  Hole {selectedHole?.number}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Par {selectedHole?.par} • {selectedHole?.distance} yards
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleSaveShot();
                }}
                style={{
                  paddingVertical: 8,
                  paddingRight: 0,
                  paddingLeft: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: selectedClub
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                    fontWeight: theme.typography.weights.title,
                  }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Shot Progress Indicator */}
          {selectedHole && (
            <LinearGradient
              colors={[theme.colors.brandGradientStart, theme.colors.brandGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 24,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.8)", marginBottom: 4 }}>
                    LOGGING SHOT
                  </Text>
                  <Text style={{ fontSize: 32, fontWeight: "700", color: "#FFFFFF" }}>
                    #{selectedHole.shots.length + 1}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.8)", marginBottom: 4 }}>
                    TOTAL SHOTS
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: "600", color: "#FFFFFF" }}>
                    {selectedHole.shots.length} so far
                  </Text>
                </View>
              </View>

              {/* Shot History Pills */}
              {selectedHole.shots.length > 0 && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {selectedHole.shots.map((shot, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      <Text style={{ fontSize: 12, color: "#FFFFFF", fontWeight: "600" }}>
                        Shot {index + 1}: {shot.club}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </LinearGradient>
          )}

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingVertical: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Club Selection Dropdown */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: theme.typography.weights.title,
                  color: theme.colors.text,
                  marginBottom: 16,
                }}
              >
                Select Club
              </Text>

              <View
                style={{
                  backgroundColor: theme.colors.glass,
                  borderRadius: theme.glass.cornerRadius,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  overflow: "hidden",
                }}
              >
                <Picker
                  selectedValue={selectedClub}
                  onValueChange={(value) => {
                    if (value) {
                      Haptics.selectionAsync();
                      setSelectedClub(value);
                    }
                  }}
                  style={{
                    color: theme.colors.text,
                    backgroundColor: "transparent",
                  }}
                  itemStyle={{
                    color: theme.colors.text,
                  }}
                >
                  <Picker.Item label="Choose a club..." value="" />
                  {CLUBS.map((club) => (
                    <Picker.Item key={club} label={club} value={club} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Shot Qualities with Glass Cards */}
            <View style={{ marginBottom: 32 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: theme.typography.weights.title,
                    color: theme.colors.text,
                  }}
                >
                  Shot Qualities
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                    marginLeft: 8,
                  }}
                >
                  (Optional - up to 3)
                </Text>
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {Object.keys(SHOT_QUALITIES).map((quality) => (
                  <TouchableOpacity
                    key={quality}
                    onPress={() => toggleQuality(quality)}
                    onLongPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setShowQualityTooltip(quality);
                    }}
                    style={{
                      backgroundColor: selectedQualities.includes(quality)
                        ? theme.colors.primary
                        : theme.colors.glass,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: theme.glass.cornerRadius,
                      borderWidth: 1,
                      borderColor: selectedQualities.includes(quality)
                        ? theme.colors.primary
                        : theme.colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      shadowColor: theme.colors.shadow,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: selectedQualities.includes(quality)
                        ? 1
                        : 0.5,
                      shadowRadius: 2,
                      elevation: selectedQualities.includes(quality) ? 3 : 1,
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: theme.typography.weights.label,
                        color: selectedQualities.includes(quality)
                          ? "#FFFFFF"
                          : theme.colors.text,
                        textTransform: "capitalize",
                      }}
                    >
                      {quality}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.selectionAsync();
                        setShowQualityTooltip(quality);
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      <Info
                        size={14}
                        color={
                          selectedQualities.includes(quality)
                            ? "#FFFFFF"
                            : theme.colors.textSecondary
                        }
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Shot Quality Slider */}
            <View style={{ marginBottom: 32 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: theme.typography.weights.title,
                    color: theme.colors.text,
                  }}
                >
                  Shot Quality
                </Text>
                <View style={{
                  backgroundColor: theme.colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                }}>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: '700',
                    color: '#FFFFFF',
                  }}>
                    {shotQuality}
                  </Text>
                </View>
              </View>

              <View style={{
                backgroundColor: theme.colors.glass,
                borderRadius: theme.glass.cornerRadius,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: 16,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                    1 (Terrible)
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                    10 (Pure)
                  </Text>
                </View>
                <Slider
                  value={shotQuality}
                  onValueChange={(value) => {
                    const rounded = Math.round(value);
                    if (rounded !== shotQuality) {
                      Haptics.selectionAsync();
                      setShotQuality(rounded);
                    }
                  }}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.border}
                  thumbTintColor={theme.colors.primary}
                />
              </View>
            </View>

            {/* Notes with Glass Input */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: theme.typography.weights.title,
                  color: theme.colors.text,
                  marginBottom: 16,
                }}
              >
                Notes (Optional)
              </Text>

              <TextInput
                style={{
                  backgroundColor: theme.colors.glass,
                  borderRadius: theme.glass.cornerRadius,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: theme.colors.text,
                  minHeight: 80,
                  textAlignVertical: "top",
                  shadowColor: theme.colors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                placeholder="Add any notes about this shot..."
                placeholderTextColor={theme.colors.placeholder}
                value={shotNote}
                onChangeText={setShotNote}
                multiline
                onFocus={() => Haptics.selectionAsync()}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Quality Tooltip Modal with Liquid Glass */}
      <Modal
        visible={showQualityTooltip !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQualityTooltip(null)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
          }}
          activeOpacity={1}
          onPress={() => setShowQualityTooltip(null)}
        >
          <Animated.View
            style={{
              backgroundColor: theme.colors.glassThick,
              borderRadius: theme.glass.cornerRadius,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 24,
              maxWidth: 300,
              shadowColor: theme.colors.shadowHeavy,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 1,
              shadowRadius: 16,
              elevation: 8,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: theme.typography.weights.title,
                color: theme.colors.text,
                marginBottom: 12,
                textTransform: "capitalize",
              }}
            >
              {showQualityTooltip}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
                lineHeight: 22,
                marginBottom: 20,
              }}
            >
              {showQualityTooltip ? SHOT_QUALITIES[showQualityTooltip] : ""}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowQualityTooltip(null);
              }}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.glass.cornerRadius,
                paddingVertical: 12,
                alignItems: "center",
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: theme.typography.weights.title,
                  color: "#FFFFFF",
                }}
              >
                Got it!
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Themed Modals */}
      <ThemedModal
        visible={showSelectClubModal}
        title="Select Club"
        message="Please select a club for this shot."
        buttons={[
          {
            text: "OK",
            onPress: () => setShowSelectClubModal(false),
          },
        ]}
        onDismiss={() => setShowSelectClubModal(false)}
      />

      <ThemedModal
        visible={showShotLoggedModal}
        title="Shot Logged! ✓"
        message={shotLoggedMessage}
        buttons={[
          {
            text: "Done with Hole",
            style: "cancel",
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowShotModal(false);
              setShowShotLoggedModal(false);
            },
          },
          {
            text: "Log Another Shot",
            onPress: () => {
              Haptics.selectionAsync();
              setSelectedClub("");
              setSelectedQualities([]);
              setShotNote("");
              setShotQuality(5);
              setShowShotLoggedModal(false);
              // Keep the modal open to log another shot
            },
          },
        ]}
        onDismiss={() => setShowShotLoggedModal(false)}
      />

      <ThemedModal
        visible={showFinishRoundModal}
        title="Finish Round"
        message={finishRoundMessage}
        buttons={[
          {
            text: "Keep Playing",
            style: "cancel",
            onPress: () => setShowFinishRoundModal(false),
          },
          {
            text: "Finish Round",
            onPress: () => {
              setShowFinishRoundModal(false);
              confirmFinishRound();
            },
          },
        ]}
        onDismiss={() => setShowFinishRoundModal(false)}
      />

      <ThemedModal
        visible={showNoShotsWarning}
        title="No Shots Logged"
        message="You haven't logged any shots yet. Are you sure you want to finish?"
        buttons={[
          {
            text: "OK",
            onPress: () => setShowNoShotsWarning(false),
          },
        ]}
        onDismiss={() => setShowNoShotsWarning(false)}
      />

      <ThemedModal
        visible={showLimitReachedModal}
        title="Limit Reached"
        message="You can select up to 3 shot qualities."
        buttons={[
          {
            text: "OK",
            onPress: () => setShowLimitReachedModal(false),
          },
        ]}
        onDismiss={() => setShowLimitReachedModal(false)}
      />
    </View>
  );
}
