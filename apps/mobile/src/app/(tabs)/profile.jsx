import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  User,
  Trophy,
  Target,
  TrendingUp,
  Settings,
  Info,
  Trash2,
  RotateCcw,
  ChevronRight,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useRound } from "@/contexts/RoundContext";
import * as Haptics from "expo-haptics";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { pastRounds, resetCurrentRound, getTotalShots } = useRound();
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const calculateStats = () => {
    if (pastRounds.length === 0) return null;

    const totalRounds = pastRounds.length;
    const totalShots = pastRounds.reduce(
      (total, round) => total + getTotalShots(round),
      0,
    );

    // Calculate total par
    const totalPar = pastRounds.reduce((total, round) => {
      return (
        total + round.holes.reduce((holeTotal, hole) => holeTotal + hole.par, 0)
      );
    }, 0);

    const avgShotsPerRound = Math.round(totalShots / totalRounds);
    const avgRelativeToPar = totalShots - totalPar;

    // Count shot qualities (miss types only)
    const qualityCounts = {};
    const missTypes = ["slice", "hook", "chunk", "thin", "fat"];

    pastRounds.forEach((round) => {
      round.holes.forEach((hole) => {
        hole.shots.forEach((shot) => {
          shot.qualities.forEach((quality) => {
            if (missTypes.includes(quality)) {
              qualityCounts[quality] = (qualityCounts[quality] || 0) + 1;
            }
          });
        });
      });
    });

    const mostCommonMiss =
      Object.entries(qualityCounts).length > 0
        ? Object.entries(qualityCounts).sort(([, a], [, b]) => b - a)[0][0]
        : null;

    return {
      totalRounds,
      totalShots,
      avgShotsPerRound,
      avgRelativeToPar,
      mostCommonMiss,
      missCount: mostCommonMiss ? qualityCounts[mostCommonMiss] : 0,
    };
  };

  const stats = calculateStats();

  const handleClearData = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Clear All Data",
      "This will delete all your rounds and reset the app. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            try {
              await resetCurrentRound();
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              Alert.alert("Data Cleared", "All your data has been cleared.");
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Error", "Failed to clear data. Please try again.");
            }
          },
        },
      ],
    );
  };

  const handleHapticsToggle = (value) => {
    if (value) {
      Haptics.selectionAsync();
    }
    setHapticsEnabled(value);
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = theme.colors.primary,
  }) => (
    <View
      style={{
        backgroundColor: theme.colors.glassThick,
        borderRadius: theme.glass.cornerRadius,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: color,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Icon size={18} color="#FFFFFF" />
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: theme.typography.weights.label,
            color: theme.colors.textSecondary,
          }}
        >
          {title}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 28,
          fontWeight: theme.typography.weights.title,
          color: theme.colors.text,
          marginBottom: 4,
        }}
      >
        {value}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.textTertiary,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );

  const SettingsRow = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    hasChevron = false,
    rightElement,
  }) => (
    <TouchableOpacity
      onPress={() => {
        if (hapticsEnabled) Haptics.selectionAsync();
        onPress?.();
      }}
      style={{
        backgroundColor: theme.colors.glass,
        borderRadius: theme.glass.cornerRadius,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 2,
      }}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: theme.colors.primary,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        <Icon size={16} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: theme.typography.weights.body,
            color: theme.colors.text,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement ||
        (hasChevron && (
          <ChevronRight size={16} color={theme.colors.textTertiary} />
        ))}
    </TouchableOpacity>
  );

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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.colors.primary,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <User size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: theme.typography.weights.title,
                  color: theme.colors.text,
                }}
              >
                Profile
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.textSecondary,
                }}
              >
                Track your golf performance
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        {stats ? (
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: theme.typography.weights.label,
                color: theme.colors.textSecondary,
                marginBottom: 16,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Performance Stats
            </Text>

            <StatCard
              icon={Trophy}
              title="Rounds Played"
              value={stats.totalRounds}
              subtitle="Total logged rounds"
            />

            <StatCard
              icon={Target}
              title="Scoring Average"
              value={
                stats.avgRelativeToPar > 0
                  ? `+${stats.avgRelativeToPar}`
                  : stats.avgRelativeToPar
              }
              subtitle="Relative to par"
              color={
                stats.avgRelativeToPar <= 0
                  ? theme.colors.scoreGood
                  : theme.colors.scoreOkay
              }
            />

            <StatCard
              icon={TrendingUp}
              title="Most Common Miss"
              value={stats.mostCommonMiss || "None"}
              subtitle={
                stats.missCount > 0
                  ? `${stats.missCount} occurrences`
                  : "Clean ball striking"
              }
              color={
                stats.mostCommonMiss
                  ? theme.colors.scoreBad
                  : theme.colors.scoreGood
              }
            />
          </View>
        ) : (
          <View
            style={{
              backgroundColor: theme.colors.glassThick,
              borderRadius: theme.glass.cornerRadius,
              padding: 24,
              marginBottom: 32,
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Target
              size={48}
              color={theme.colors.textTertiary}
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: theme.typography.weights.label,
                color: theme.colors.text,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              No Stats Yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                textAlign: "center",
              }}
            >
              Play some rounds to see your progress
            </Text>
          </View>
        )}

        {/* Settings Section */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: theme.typography.weights.label,
            color: theme.colors.textSecondary,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Settings
        </Text>

        <SettingsRow
          icon={Settings}
          title="App Settings"
          subtitle="Appearance, golf experience, and more"
          hasChevron
          onPress={() => router.push("/(tabs)/settings")}
        />

        <SettingsRow
          icon={Settings}
          title="Haptic Feedback"
          subtitle="Feel the app respond to your touch"
          rightElement={
            <Switch
              value={hapticsEnabled}
              onValueChange={handleHapticsToggle}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <SettingsRow
          icon={Info}
          title="About"
          subtitle="Version 1.0.0"
          hasChevron
          onPress={() => {
            Alert.alert(
              "Golf Shot Tracker",
              "Track your rounds. Analyze your game.\n\nVersion 1.0.0\nBuilt for weekend golfers who want to improve",
            );
          }}
        />

        {/* Danger Zone */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: theme.typography.weights.label,
            color: theme.colors.scoreBad,
            marginBottom: 16,
            marginTop: 32,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Danger Zone
        </Text>

        <SettingsRow
          icon={Trash2}
          title="Clear All Data"
          subtitle="Delete all rounds and reset the app"
          onPress={handleClearData}
        />
      </ScrollView>
    </View>
  );
}
