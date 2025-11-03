import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Flag, Target } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useRound } from "@/contexts/RoundContext";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

export default function HoleDetailScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentRound, pastRounds } = useRound();

  // Parse params
  const holeNumber = parseInt(params.holeNumber);
  const roundId = params.roundId;
  const isCurrentRound = params.isCurrentRound === "true";

  // Get the round and hole
  const round = isCurrentRound
    ? currentRound
    : pastRounds.find((r) => r.id === roundId);

  const hole = round?.holes.find((h) => h.number === holeNumber);

  if (!hole) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.colors.text }}>Hole not found</Text>
      </View>
    );
  }

  const getShotQualityColor = (rating) => {
    if (rating >= 8) return theme.colors.scoreGood;
    if (rating >= 5) return theme.colors.scoreOkay;
    return theme.colors.scoreBad;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBarStyle} />

      {/* Header with Gradient */}
      <LinearGradient
        colors={[theme.colors.brandTealDark, theme.colors.brandTealLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: 20,
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
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
            >
              <Flag size={20} color="#FFFFFF" />
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#FFFFFF",
                  marginLeft: 8,
                }}
              >
                Hole {hole.number}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              Par {hole.par} • {hole.distance} yards
            </Text>
          </View>

          {/* Score Badge */}
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.25)",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              {hole.shots.length}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "rgba(255, 255, 255, 0.8)",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {hole.shots.length === 1 ? "Shot" : "Shots"}
            </Text>
          </View>
        </View>

        {/* Course Name */}
        <Text
          style={{
            fontSize: 14,
            color: "rgba(255, 255, 255, 0.8)",
            marginTop: 4,
          }}
        >
          {round.courseName}
        </Text>
      </LinearGradient>

      {/* Shots List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {hole.shots.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.glass,
                borderWidth: 1,
                borderColor: theme.colors.border,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Target size={40} color={theme.colors.textTertiary} />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: theme.typography.weights.title,
                color: theme.colors.text,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              No Shots Logged
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                textAlign: "center",
              }}
            >
              Shots will appear here once you log them
            </Text>
          </View>
        ) : (
          <>
            {hole.shots.map((shot, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: theme.colors.glassThick,
                  borderRadius: theme.glass.cornerRadius,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  padding: 20,
                  marginBottom: index === hole.shots.length - 1 ? 0 : 16,
                  shadowColor: theme.colors.shadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {/* Shot Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginBottom: 4,
                      }}
                    >
                      Shot {index + 1}
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: theme.typography.weights.title,
                        color: theme.colors.text,
                      }}
                    >
                      {shot.club}
                    </Text>
                  </View>

                  {/* Quality Rating Badge */}
                  {shot.quality !== undefined && (
                    <View
                      style={{
                        backgroundColor: theme.colors.glass,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: theme.glass.cornerRadius,
                        borderWidth: 1,
                        borderColor: getShotQualityColor(shot.quality),
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: theme.typography.weights.title,
                          color: getShotQualityColor(shot.quality),
                        }}
                      >
                        {shot.quality}/10
                      </Text>
                    </View>
                  )}
                </View>

                {/* Shot Qualities Tags */}
                {shot.qualities && shot.qualities.length > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                        marginRight: 4,
                        alignSelf: "center",
                      }}
                    >
                      Tags:
                    </Text>
                    {shot.qualities.map((quality, qIndex) => (
                      <View
                        key={qIndex}
                        style={{
                          backgroundColor: theme.colors.glass,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: theme.glass.cornerRadius,
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: theme.typography.weights.label,
                            color: theme.colors.primary,
                            textTransform: "capitalize",
                          }}
                        >
                          {quality}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Notes */}
                {shot.note && shot.note.trim() !== "" && (
                  <View
                    style={{
                      backgroundColor: theme.colors.glass,
                      borderRadius: theme.glass.cornerRadius,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      padding: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginBottom: 6,
                      }}
                    >
                      Notes
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.colors.text,
                        lineHeight: 20,
                      }}
                    >
                      {shot.note}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {/* Hole Summary */}
            <View
              style={{
                backgroundColor: theme.colors.glassThick,
                borderRadius: theme.glass.cornerRadius,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: 20,
                marginTop: 24,
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 12,
                }}
              >
                Hole Summary
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      marginBottom: 4,
                    }}
                  >
                    Total Shots
                  </Text>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color: theme.colors.primary,
                    }}
                  >
                    {hole.shots.length}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      marginBottom: 4,
                    }}
                  >
                    Score vs Par
                  </Text>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color:
                        hole.shots.length < hole.par
                          ? theme.colors.scoreGood
                          : hole.shots.length === hole.par
                          ? theme.colors.primary
                          : hole.shots.length === hole.par + 1
                          ? theme.colors.scoreOkay
                          : theme.colors.scoreBad,
                    }}
                  >
                    {hole.shots.length - hole.par >= 0
                      ? `+${hole.shots.length - hole.par}`
                      : hole.shots.length - hole.par}
                  </Text>
                </View>
              </View>

              {/* Average Quality */}
              {hole.shots.some((s) => s.quality !== undefined) && (
                <View
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      marginBottom: 8,
                    }}
                  >
                    Average Shot Quality
                  </Text>
                  {(() => {
                    const ratingsWithValues = hole.shots.filter(
                      (s) => s.quality !== undefined
                    );
                    const avgRating =
                      ratingsWithValues.reduce(
                        (sum, s) => sum + s.quality,
                        0
                      ) / ratingsWithValues.length;

                    return (
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: theme.typography.weights.title,
                          color: getShotQualityColor(Math.round(avgRating)),
                        }}
                      >
                        {avgRating.toFixed(1)}/10
                      </Text>
                    );
                  })()}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
