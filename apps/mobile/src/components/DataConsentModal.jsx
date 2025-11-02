import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Shield, Check, X } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useRound } from "@/contexts/RoundContext";
import * as Haptics from "expo-haptics";

export default function DataConsentModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { setDataConsent } = useRound();

  const handleAccept = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setDataConsent(true);
    onClose();
  };

  const handleDecline = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setDataConsent(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.colors.primary,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Shield size={32} color="#FFFFFF" />
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: theme.colors.text,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Privacy & Data Collection
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: "center",
              }}
            >
              Help us understand how you'd like your golf data handled
            </Text>
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
          {/* What We Collect */}
          <View
            style={{
              backgroundColor: theme.colors.glass,
              borderRadius: theme.glass.cornerRadius,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 20,
              marginBottom: 20,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: theme.typography.weights.title,
                color: theme.colors.text,
                marginBottom: 12,
              }}
            >
              What Data We Collect
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
                lineHeight: 24,
                marginBottom: 16,
              }}
            >
              To help you track and improve your golf game, this app collects:
            </Text>
            <View style={{ marginLeft: 16 }}>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text,
                  lineHeight: 22,
                  marginBottom: 8,
                }}
              >
                • Golf shot details (club used, shot quality, personal notes)
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text,
                  lineHeight: 22,
                  marginBottom: 8,
                }}
              >
                • Course information and scores
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text,
                  lineHeight: 22,
                  marginBottom: 8,
                }}
              >
                • App preferences and settings
              </Text>
            </View>
          </View>

          {/* How We Store It */}
          <View
            style={{
              backgroundColor: theme.colors.glass,
              borderRadius: theme.glass.cornerRadius,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 20,
              marginBottom: 20,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: theme.typography.weights.title,
                color: theme.colors.text,
                marginBottom: 12,
              }}
            >
              How We Store Your Data
            </Text>
            <View style={{ marginLeft: 16 }}>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text,
                  lineHeight: 22,
                  marginBottom: 8,
                }}
              >
                • All data is stored locally on your device only
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text,
                  lineHeight: 22,
                  marginBottom: 8,
                }}
              >
                • No data is transmitted to external servers
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text,
                  lineHeight: 22,
                  marginBottom: 8,
                }}
              >
                • You maintain full control of your information
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text,
                  lineHeight: 22,
                }}
              >
                • You can delete all data at any time in Settings
              </Text>
            </View>
          </View>

          {/* Your Rights */}
          <View
            style={{
              backgroundColor: theme.colors.glass,
              borderRadius: theme.glass.cornerRadius,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 20,
              marginBottom: 32,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: theme.typography.weights.title,
                color: theme.colors.text,
                marginBottom: 12,
              }}
            >
              Your Rights
            </Text>
            <View style={{ marginLeft: 16 }}>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text,
                  lineHeight: 22,
                  marginBottom: 8,
                }}
              >
                • View all your data in the Journal section
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text,
                  lineHeight: 22,
                  marginBottom: 8,
                }}
              >
                • Delete individual rounds or clear all data
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text,
                  lineHeight: 22,
                  marginBottom: 8,
                }}
              >
                • Change your consent preference at any time
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.colors.text,
                  lineHeight: 22,
                }}
              >
                • Use the app without data collection (limited functionality)
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 16 }}>
            <TouchableOpacity
              onPress={handleAccept}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.glass.cornerRadius,
                paddingVertical: 16,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 8,
                elevation: 6,
              }}
              activeOpacity={0.9}
            >
              <Check size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: theme.typography.weights.title,
                  color: "#FFFFFF",
                }}
              >
                Accept & Continue
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDecline}
              style={{
                backgroundColor: theme.colors.glass,
                borderRadius: theme.glass.cornerRadius,
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingVertical: 16,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                elevation: 2,
              }}
              activeOpacity={0.8}
            >
              <X
                size={20}
                color={theme.colors.text}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: theme.typography.weights.title,
                  color: theme.colors.text,
                }}
              >
                Use Without Data Collection
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 12,
              color: theme.colors.textTertiary,
              textAlign: "center",
              marginTop: 20,
              lineHeight: 18,
            }}
          >
            You can change this preference at any time in the Settings section.
            This choice only affects data collection for golf performance
            tracking.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
