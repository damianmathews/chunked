import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Moon,
  Sun,
  Zap,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  ExternalLink,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useRound } from "@/contexts/RoundContext";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { resetCurrentRound, clearAllData } = useRound();

  // Settings state
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [showMissCategories, setShowMissCategories] = useState(true);

  const handleDarkModeToggle = async () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await theme.toggleTheme();
  };

  const handleBeginnerModeToggle = (value) => {
    setBeginnerMode(value);
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowMissCategories(!value); // Beginner mode hides miss categories
  };

  const handleHapticsToggle = (value) => {
    setHapticsEnabled(value);
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const testHaptics = () => {
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleClearAllData = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your golf rounds, shot data, and settings. This action cannot be undone.\n\nAre you sure you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All Data",
          style: "destructive",
          onPress: async () => {
            try {
              // Use the clearAllData function from RoundContext
              await clearAllData();

              if (hapticsEnabled) {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
              }

              Alert.alert(
                "Data Cleared",
                "All your golf data has been permanently deleted. The app will restart to apply changes.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Navigate to journal to show empty state
                      router.push("/(tabs)/journal");
                    },
                  },
                ],
              );
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert("Error", "Failed to clear data. Please try again.");
            }
          },
        },
      ],
    );
  };

  const openPrivacyPolicy = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      "Privacy Policy",
      "Golf Shot Tracker Privacy Policy\n\nData Collection:\n• Golf shot details (club, shot quality, notes)\n• Course information and scores\n• App preferences and settings\n\nData Storage:\n• All data is stored locally on your device\n• No data is transmitted to external servers\n• You maintain full control of your information\n\nData Management:\n• View all data in the Journal section\n• Delete individual rounds or clear all data\n• Export functionality may be added in future updates\n\nContact:\n• For questions about data handling, use the app's feedback feature\n\nLast updated: November 1, 2025",
      [{ text: "Got it", style: "default" }],
    );
  };

  const SettingRow = ({ icon, title, description, children, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.glass,
        borderRadius: theme.glass.cornerRadius,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 20,
        marginBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 2,
      }}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.colors.primary,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        {icon}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: theme.typography.weights.title,
            color: theme.colors.text,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        {description && (
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
            }}
          >
            {description}
          </Text>
        )}
      </View>

      {children}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBarStyle} />

      {/* Header */}
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
              if (hapticsEnabled) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
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
                fontSize: 24,
                fontWeight: "700",
                color: theme.colors.text,
              }}
            >
              Settings
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
              }}
            >
              Customize your experience
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: theme.typography.weights.title,
            color: theme.colors.text,
            marginBottom: 16,
          }}
        >
          Appearance
        </Text>

        <SettingRow
          icon={
            theme.isDark ? (
              <Moon size={20} color="#FFFFFF" />
            ) : (
              <Sun size={20} color="#FFFFFF" />
            )
          }
          title="Dark Mode"
          description="Switch between light and dark themes"
        >
          <Switch
            value={theme.isDark}
            onValueChange={handleDarkModeToggle}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={theme.colors.border}
          />
        </SettingRow>

        {/* Golf Experience Section */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: theme.typography.weights.title,
            color: theme.colors.text,
            marginBottom: 16,
            marginTop: 32,
          }}
        >
          Golf Experience
        </Text>

        <SettingRow
          icon={<Eye size={20} color="#FFFFFF" />}
          title="Beginner Mode"
          description="Simplifies interface by hiding advanced shot tracking options"
        >
          <Switch
            value={beginnerMode}
            onValueChange={handleBeginnerModeToggle}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={theme.colors.border}
          />
        </SettingRow>

        <SettingRow
          icon={
            showMissCategories ? (
              <Eye size={20} color="#FFFFFF" />
            ) : (
              <EyeOff size={20} color="#FFFFFF" />
            )
          }
          title="Show Miss Categories"
          description="Display slice, hook, chunk options when logging shots"
        >
          <Switch
            value={showMissCategories}
            onValueChange={setShowMissCategories}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={theme.colors.border}
            disabled={beginnerMode} // Disabled in beginner mode
          />
        </SettingRow>

        {/* Device Settings Section */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: theme.typography.weights.title,
            color: theme.colors.text,
            marginBottom: 16,
            marginTop: 32,
          }}
        >
          Device
        </Text>

        <SettingRow
          icon={<Zap size={20} color="#FFFFFF" />}
          title="Haptic Feedback"
          description="Physical vibrations for button taps and notifications"
          onPress={testHaptics}
        >
          <Switch
            value={hapticsEnabled}
            onValueChange={handleHapticsToggle}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={theme.colors.border}
          />
        </SettingRow>

        {/* Privacy & Data Section */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: theme.typography.weights.title,
            color: theme.colors.text,
            marginBottom: 16,
            marginTop: 32,
          }}
        >
          Privacy & Data
        </Text>

        <SettingRow
          icon={<Shield size={20} color="#FFFFFF" />}
          title="Privacy Policy"
          description="View how your golf data is collected and stored"
          onPress={openPrivacyPolicy}
        >
          <ExternalLink size={20} color={theme.colors.textSecondary} />
        </SettingRow>

        <SettingRow
          icon={<Trash2 size={20} color="#FFFFFF" />}
          title="Clear All Data"
          description="Permanently delete all golf rounds and settings"
          onPress={handleClearAllData}
        >
          <View
            style={{
              backgroundColor: theme.colors.danger,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: theme.typography.weights.label,
              }}
            >
              Delete
            </Text>
          </View>
        </SettingRow>

        {/* Info Section */}
        <View
          style={{
            backgroundColor: theme.colors.glass,
            borderRadius: theme.glass.cornerRadius,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: 20,
            marginTop: 32,
            alignItems: "center",
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <SettingsIcon size={32} color={theme.colors.textSecondary} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: theme.typography.weights.title,
              color: theme.colors.text,
              textAlign: "center",
              marginTop: 12,
              marginBottom: 8,
            }}
          >
            Golf Shot Tracker
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Version 1.0.0
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.textTertiary,
              textAlign: "center",
            }}
          >
            All data stored locally on your device
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
