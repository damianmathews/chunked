import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Calendar, MapPin, Trash2, Target } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useRound } from "@/contexts/RoundContext";
import * as Haptics from "expo-haptics";

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { pastRounds, deleteRound, getTotalShots, getHoleScore } = useRound();
  const [expandedRound, setExpandedRound] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const handleDeleteRound = (roundId, courseName) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Round",
      `Are you sure you want to delete your round at ${courseName}? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteRound(roundId);
          },
        },
      ],
    );
  };

  const toggleRoundExpansion = (roundId) => {
    Haptics.selectionAsync();
    setExpandedRound(expandedRound === roundId ? null : roundId);
  };

  const getSoulfulRoundSummary = (totalShots) => {
    if (totalShots < 80) return "Excellent round. Pro-level scoring.";
    if (totalShots < 100) return "Solid performance. Good execution.";
    if (totalShots < 120) return "Room for improvement. Keep practicing.";
    return "Challenging round. Focus on fundamentals.";
  };

  const EmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingBottom: 60,
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
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Target size={48} color={theme.colors.textTertiary} />
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: theme.typography.weights.title,
          color: theme.colors.text,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        No rounds yet
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: theme.colors.textSecondary,
          textAlign: "center",
          lineHeight: 24,
          marginBottom: 32,
        }}
      >
        Start logging your golf shots and build your personal journal of
        improvement!
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
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 6,
        }}
        activeOpacity={0.9}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: theme.typography.weights.title,
            color: "#FFFFFF",
          }}
        >
          Start Your First Round
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBarStyle} />

      {/* Header with Liquid Glass */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: 20,
          backgroundColor: theme.colors.glassThick,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: theme.colors.text,
            marginBottom: 8,
          }}
        >
          Golf Journal
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: theme.colors.textSecondary,
          }}
        >
          Track your rounds and analyze your game
        </Text>
      </View>

      {/* Journal Content */}
      {pastRounds.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {pastRounds.map((round, index) => {
            const totalShots = getTotalShots(round);
            const isExpanded = expandedRound === round.id;

            return (
              <TouchableOpacity
                key={round.id}
                onPress={() => toggleRoundExpansion(round.id)}
                style={{
                  backgroundColor: theme.colors.glassThick,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.glass.cornerRadius,
                  padding: 20,
                  marginBottom: index === pastRounds.length - 1 ? 0 : 16,
                  shadowColor: theme.colors.shadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                activeOpacity={0.8}
              >
                {/* Round Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1, marginRight: 16 }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: theme.typography.weights.title,
                        color: theme.colors.text,
                        marginBottom: 4,
                      }}
                      numberOfLines={1}
                    >
                      {round.courseName}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Calendar size={14} color={theme.colors.textSecondary} />
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.colors.textSecondary,
                          marginLeft: 6,
                          fontWeight: theme.typography.weights.body,
                        }}
                      >
                        {formatDate(round.date)}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <MapPin size={14} color={theme.colors.textSecondary} />
                      <Text
                        style={{
                          fontSize: 14,
                          color: theme.colors.textSecondary,
                          marginLeft: 6,
                          fontWeight: theme.typography.weights.body,
                        }}
                      >
                        {round.tee} tees
                      </Text>
                    </View>

                    {/* Soulful Summary */}
                    <Text
                      style={{
                        fontSize: 13,
                        color: theme.colors.primary,
                        fontWeight: theme.typography.weights.label,
                        fontStyle: "italic",
                      }}
                    >
                      {getSoulfulRoundSummary(totalShots)}
                    </Text>
                  </View>

                  {/* Total Shots with Glass Badge */}
                  <View
                    style={{
                      alignItems: "center",
                      backgroundColor: theme.colors.glass,
                      borderRadius: theme.glass.cornerRadius,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      minWidth: 60,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: "700",
                        color: theme.colors.primary,
                      }}
                    >
                      {totalShots}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: theme.colors.textSecondary,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontWeight: theme.typography.weights.label,
                      }}
                    >
                      Shots
                    </Text>
                  </View>
                </View>

                {/* Expanded Hole Details with Glass Styling */}
                {isExpanded && (
                  <View
                    style={{
                      backgroundColor: theme.colors.glass,
                      borderRadius: theme.glass.cornerRadius,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      paddingTop: 16,
                      paddingHorizontal: 16,
                      paddingBottom: 12,
                      marginTop: 8,
                      shadowColor: theme.colors.shadow,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    {round.holes.map((hole, holeIndex) => {
                      if (hole.shots.length === 0) return null;

                      const holeScore = getHoleScore(hole);
                      const isPar = hole.shots.length === hole.par;
                      const isBirdie = hole.shots.length < hole.par;
                      const isBogeyPlus = hole.shots.length > hole.par + 1;

                      return (
                        <TouchableOpacity
                          key={hole.number}
                          onPress={() => {
                            Haptics.selectionAsync();
                            router.push({
                              pathname: "/hole-detail",
                              params: {
                                holeNumber: hole.number,
                                roundId: round.id,
                                isCurrentRound: "false",
                              },
                            });
                          }}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingVertical: 10,
                            borderBottomWidth:
                              holeIndex <
                              round.holes.filter((h) => h.shots.length > 0)
                                .length -
                                1
                                ? 1
                                : 0,
                            borderBottomColor: theme.colors.borderLight,
                          }}
                          activeOpacity={0.7}
                        >
                          <View>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: theme.typography.weights.title,
                                color: theme.colors.text,
                              }}
                            >
                              Hole {hole.number}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: theme.colors.textSecondary,
                                fontWeight: theme.typography.weights.body,
                              }}
                            >
                              Par {hole.par} • {hole.distance}yds
                            </Text>
                          </View>

                          <View style={{ alignItems: "flex-end" }}>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: theme.typography.weights.title,
                                color: isBirdie
                                  ? theme.colors.scoreGood
                                  : isPar
                                    ? theme.colors.primary
                                    : isBogeyPlus
                                      ? theme.colors.scoreBad
                                      : theme.colors.scoreOkay,
                              }}
                            >
                              {hole.shots.length}
                            </Text>
                            <Text
                              style={{
                                fontSize: 11,
                                color: theme.colors.textSecondary,
                                fontWeight: theme.typography.weights.label,
                              }}
                            >
                              {holeScore}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}

                    {/* Delete Button with Glass Styling */}
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        handleDeleteRound(round.id, round.courseName);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 12,
                        marginTop: 16,
                        backgroundColor: theme.colors.glass,
                        borderRadius: theme.glass.cornerRadius,
                        borderWidth: 1,
                        borderColor: `${theme.colors.scoreBad}30`,
                        shadowColor: theme.colors.shadow,
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                      activeOpacity={0.8}
                    >
                      <Trash2 size={16} color={theme.colors.scoreBad} />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: theme.typography.weights.label,
                          color: theme.colors.scoreBad,
                          marginLeft: 8,
                        }}
                      >
                        Delete Round
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
