import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Trophy,
  AlertCircle,
  BarChart3,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useRound } from "@/contexts/RoundContext";
import Svg, { Path, Circle, Line, Rect, Text as SvgText } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============== METRIC CALCULATIONS ==============

const calculateMetrics = (pastRounds) => {
  if (!pastRounds || pastRounds.length === 0) return null;

  const allShots = [];
  const roundMetrics = [];

  pastRounds.forEach((round) => {
    const roundShots = [];
    round.holes.forEach((hole) => {
      hole.shots.forEach((shot) => {
        const shotWithMeta = {
          ...shot,
          roundId: round.id,
          holeNumber: hole.number,
          par: hole.par,
        };
        allShots.push(shotWithMeta);
        roundShots.push(shotWithMeta);
      });
    });

    const roundAvgQuality = roundShots.length > 0
      ? roundShots.reduce((sum, s) => sum + (s.quality || 5), 0) / roundShots.length
      : 0;

    const roundGoodShots = roundShots.filter(s =>
      s.qualities.includes("good") || s.qualities.length === 0
    ).length;

    roundMetrics.push({
      id: round.id,
      date: round.date,
      avgQuality: roundAvgQuality,
      gsr: roundShots.length > 0 ? (roundGoodShots / roundShots.length) * 100 : 0,
      totalShots: roundShots.length,
    });
  });

  const totalShots = allShots.length;

  // Average shot quality
  const avgQuality = totalShots > 0
    ? allShots.reduce((sum, s) => sum + (s.quality || 5), 0) / totalShots
    : 0;

  // Good Shot Rate (GSR): shots with no miss qualities or "good"
  const goodShots = allShots.filter(s =>
    s.qualities.includes("good") || s.qualities.length === 0
  ).length;
  const gsr = totalShots > 0 ? (goodShots / totalShots) * 100 : 0;

  // Miss distribution
  const missCounts = {};
  allShots.forEach(shot => {
    shot.qualities.forEach(quality => {
      if (quality !== "good") {
        missCounts[quality] = (missCounts[quality] || 0) + 1;
      }
    });
  });

  const mostCommonMiss = Object.entries(missCounts).length > 0
    ? Object.entries(missCounts).sort(([,a], [,b]) => b - a)[0][0]
    : null;

  // Consistency Index (CI)
  const qualities = allShots.map(s => s.quality || 5);
  const mean = qualities.reduce((a, b) => a + b, 0) / qualities.length;
  const variance = qualities.reduce((sum, q) => sum + Math.pow(q - mean, 2), 0) / qualities.length;
  const stdev = Math.sqrt(variance);
  const ci = Math.max(0, Math.min(1, 1 - (stdev / 10)));

  // Quality trend (linear regression slope)
  const n = roundMetrics.length;
  let qualityTrendSlope = 0;
  if (n >= 2) {
    const sumX = roundMetrics.reduce((s, r, i) => s + i, 0);
    const sumY = roundMetrics.reduce((s, r) => s + r.avgQuality, 0);
    const sumXY = roundMetrics.reduce((s, r, i) => s + i * r.avgQuality, 0);
    const sumX2 = roundMetrics.reduce((s, r, i) => s + i * i, 0);
    qualityTrendSlope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  // Stroke Loss Proxy (SLP) per shot
  const calculateSLP = (shot) => {
    const qNorm = (shot.quality || 5) / 10;
    const hasMiss = shot.qualities.length > 0 && !shot.qualities.includes("good");
    const missBonus = hasMiss ? 1 : 0;
    return (1 - qNorm) * (1 + missBonus);
  };

  // SLP by club
  const slpByClub = {};
  const shotsByClub = {};
  allShots.forEach(shot => {
    const club = shot.club;
    if (!slpByClub[club]) {
      slpByClub[club] = [];
      shotsByClub[club] = 0;
    }
    slpByClub[club].push(calculateSLP(shot));
    shotsByClub[club]++;
  });

  const clubStats = Object.entries(slpByClub).map(([club, slps]) => ({
    club,
    avgSLP: slps.reduce((a,b) => a+b, 0) / slps.length,
    totalSLP: slps.reduce((a,b) => a+b, 0),
    count: shotsByClub[club],
    avgQuality: allShots
      .filter(s => s.club === club)
      .reduce((sum, s) => sum + (s.quality || 5), 0) / shotsByClub[club],
    gsr: (allShots.filter(s => s.club === club && (s.qualities.length === 0 || s.qualities.includes("good"))).length / shotsByClub[club]) * 100,
  })).sort((a, b) => b.avgQuality - a.avgQuality);

  // SLP by miss type
  const slpByMiss = {};
  const shotsByMiss = {};
  allShots.forEach(shot => {
    shot.qualities.forEach(quality => {
      if (quality !== "good") {
        if (!slpByMiss[quality]) {
          slpByMiss[quality] = [];
          shotsByMiss[quality] = 0;
        }
        slpByMiss[quality].push(calculateSLP(shot));
        shotsByMiss[quality]++;
      }
    });
  });

  const missStats = Object.entries(slpByMiss).map(([miss, slps]) => ({
    miss,
    avgSLP: slps.reduce((a,b) => a+b, 0) / slps.length,
    totalSLP: slps.reduce((a,b) => a+b, 0),
    count: shotsByMiss[miss],
  })).sort((a, b) => b.totalSLP - a.totalSLP);

  return {
    totalRounds: pastRounds.length,
    totalShots,
    avgQuality,
    gsr,
    mostCommonMiss,
    missCount: missCounts[mostCommonMiss] || 0,
    ci,
    qualityTrendSlope,
    roundMetrics,
    clubStats,
    missStats,
    missCounts,
  };
};

// ============== CHART COMPONENTS ==============

const MicroSparkline = ({ data, width = 60, height = 20, color }) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <Svg width={width} height={height}>
      <Path
        d={`M ${points}`}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const QualityLineChart = ({ data, theme }) => {
  if (!data || data.length < 2) return null;

  const chartWidth = SCREEN_WIDTH - 48;
  const chartHeight = 200;
  const padding = 40;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;

  const maxQuality = 10;
  const minQuality = 0;

  const points = data.map((point, i) => {
    const x = padding + (i / (data.length - 1)) * graphWidth;
    const y = padding + graphHeight - ((point.avgQuality - minQuality) / (maxQuality - minQuality)) * graphHeight;
    return { x, y, value: point.avgQuality };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  return (
    <Svg width={chartWidth} height={chartHeight}>
      {/* Grid lines */}
      {[0, 2.5, 5, 7.5, 10].map(tick => {
        const y = padding + graphHeight - ((tick / maxQuality) * graphHeight);
        return (
          <Line
            key={tick}
            x1={padding}
            y1={y}
            x2={chartWidth - padding}
            y2={y}
            stroke={theme.colors.border}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        );
      })}

      {/* Line */}
      <Path
        d={pathData}
        stroke={theme.colors.brandGradientEnd}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Points */}
      {points.map((p, i) => (
        <Circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill={theme.colors.brandGradientEnd}
        />
      ))}

      {/* Y-axis labels */}
      <SvgText
        x={padding - 10}
        y={padding + 5}
        fontSize="10"
        fill={theme.colors.textSecondary}
        textAnchor="end"
      >
        10
      </SvgText>
      <SvgText
        x={padding - 10}
        y={padding + graphHeight / 2 + 5}
        fontSize="10"
        fill={theme.colors.textSecondary}
        textAnchor="end"
      >
        5
      </SvgText>
      <SvgText
        x={padding - 10}
        y={padding + graphHeight + 5}
        fontSize="10"
        fill={theme.colors.textSecondary}
        textAnchor="end"
      >
        0
      </SvgText>
    </Svg>
  );
};

const HorizontalBarChart = ({ data, theme, maxValue }) => {
  const barHeight = 36;
  const chartWidth = SCREEN_WIDTH - 48;
  const maxBarWidth = chartWidth - 140;

  return (
    <View>
      {data.slice(0, 8).map((item, i) => {
        const barWidth = (item.value / maxValue) * maxBarWidth;
        const color = item.value >= 7
          ? theme.colors.scoreGood
          : item.value >= 5
            ? theme.colors.scoreOkay
            : theme.colors.scoreBad;

        return (
          <View key={i} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.text,
                  width: 90,
                  fontWeight: "500",
                }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    height: 24,
                    width: Math.max(barWidth, 2),
                    backgroundColor: color,
                    borderRadius: 6,
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.text,
                    marginLeft: 8,
                    fontWeight: "600",
                  }}
                >
                  {item.value.toFixed(1)}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: theme.colors.textTertiary,
                  marginLeft: 8,
                  width: 40,
                  textAlign: "right",
                }}
              >
                ({item.count})
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ============== UI COMPONENTS ==============

const StatCard = ({ icon: Icon, title, value, subtitle, trend, sparklineData, theme }) => (
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
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: theme.colors.primary,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Icon size={16} color="#FFFFFF" />
      </View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: theme.typography.weights.label,
          color: theme.colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
    </View>

    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 32,
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
              fontSize: 13,
              color: theme.colors.textTertiary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {sparklineData && (
        <View style={{ alignItems: "flex-end" }}>
          {trend && (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              {trend === "up" ? (
                <TrendingUp size={14} color={theme.colors.scoreGood} />
              ) : trend === "down" ? (
                <TrendingDown size={14} color={theme.colors.scoreBad} />
              ) : null}
            </View>
          )}
          <MicroSparkline
            data={sparklineData}
            width={60}
            height={24}
            color={theme.colors.brandGradientEnd}
          />
        </View>
      )}
    </View>
  </View>
);

const SectionHeader = ({ title, theme }) => (
  <Text
    style={{
      fontSize: 18,
      fontWeight: theme.typography.weights.title,
      color: theme.colors.text,
      marginTop: 32,
      marginBottom: 16,
    }}
  >
    {title}
  </Text>
);

// ============== MAIN COMPONENT ==============

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { pastRounds } = useRound();

  const metrics = useMemo(() => calculateMetrics(pastRounds), [pastRounds]);

  if (!metrics) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar style={theme.colors.statusBarStyle} />
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 100,
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80%",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.glassThick,
              borderRadius: theme.glass.cornerRadius,
              padding: 32,
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
            <BarChart3
              size={64}
              color={theme.colors.textTertiary}
              style={{ marginBottom: 20 }}
            />
            <Text
              style={{
                fontSize: 22,
                fontWeight: theme.typography.weights.title,
                color: theme.colors.text,
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              No Analytics Yet
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: theme.colors.textSecondary,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Play some rounds and log your shots to see beautiful insights about your game
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const recentRounds = metrics.roundMetrics.slice(0, 7);
  const qualitySparkline = recentRounds.reverse().map(r => r.avgQuality);
  const gsrSparkline = recentRounds.map(r => r.gsr);

  const qualityTrend = metrics.qualityTrendSlope > 0.05 ? "up" : metrics.qualityTrendSlope < -0.05 ? "down" : null;

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
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: theme.typography.weights.title,
              color: theme.colors.text,
              marginBottom: 4,
            }}
          >
            Performance
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: theme.colors.textSecondary,
            }}
          >
            {metrics.totalRounds} rounds • {metrics.totalShots} shots tracked
          </Text>
        </View>

        {/* Hero Stats */}
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <StatCard
              icon={Trophy}
              title="Rounds"
              value={metrics.totalRounds}
              theme={theme}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <StatCard
              icon={Target}
              title="Avg Quality"
              value={metrics.avgQuality.toFixed(1)}
              subtitle="out of 10"
              sparklineData={qualitySparkline}
              trend={qualityTrend}
              theme={theme}
            />
          </View>
        </View>

        <StatCard
          icon={TrendingUp}
          title="Good Shot Rate"
          value={`${metrics.gsr.toFixed(0)}%`}
          subtitle={metrics.gsr >= 65 ? "Excellent contact" : metrics.gsr >= 50 ? "Solid ball striking" : "Room to improve"}
          sparklineData={gsrSparkline}
          theme={theme}
        />

        <StatCard
          icon={AlertCircle}
          title="Consistency Index"
          value={`${(metrics.ci * 100).toFixed(0)}%`}
          subtitle={metrics.ci >= 0.7 ? "Very consistent" : metrics.ci >= 0.5 ? "Moderately consistent" : "Work on consistency"}
          theme={theme}
        />

        {/* Quality Over Time */}
        <SectionHeader title="Quality Trend" theme={theme} />
        <View
          style={{
            backgroundColor: theme.colors.glassThick,
            borderRadius: theme.glass.cornerRadius,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <QualityLineChart data={metrics.roundMetrics.slice().reverse()} theme={theme} />
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.textTertiary,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Average shot quality per round
          </Text>
        </View>

        {/* Club Reliability */}
        <SectionHeader title="Club Performance" theme={theme} />
        <View
          style={{
            backgroundColor: theme.colors.glassThick,
            borderRadius: theme.glass.cornerRadius,
            padding: 20,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <HorizontalBarChart
            data={metrics.clubStats.map(c => ({
              label: c.club,
              value: c.avgQuality,
              count: c.count,
            }))}
            theme={theme}
            maxValue={10}
          />
        </View>

        {/* Biggest Issues */}
        {metrics.missStats.length > 0 && (
          <>
            <SectionHeader title="Areas to Improve" theme={theme} />
            <View
              style={{
                backgroundColor: theme.colors.glassThick,
                borderRadius: theme.glass.cornerRadius,
                padding: 20,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textTertiary,
                  marginBottom: 16,
                }}
              >
                Miss patterns ranked by impact (Stroke Loss Proxy)
              </Text>
              {metrics.missStats.slice(0, 5).map((miss, i) => (
                <View
                  key={miss.miss}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: theme.colors.textTertiary,
                      width: 24,
                    }}
                  >
                    {i + 1}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: theme.colors.text,
                        textTransform: "capitalize",
                      }}
                    >
                      {miss.miss}
                    </Text>
                    <View style={{ flexDirection: "row", marginTop: 4 }}>
                      <View
                        style={{
                          height: 6,
                          width: `${(miss.totalSLP / metrics.missStats[0].totalSLP) * 100}%`,
                          backgroundColor: theme.colors.scoreBad,
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: theme.colors.textSecondary,
                      marginLeft: 12,
                    }}
                  >
                    {miss.count}× ({miss.avgSLP.toFixed(2)} avg)
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Most Common Miss */}
        {metrics.mostCommonMiss && (
          <View
            style={{
              backgroundColor: theme.colors.glass,
              borderRadius: theme.glass.cornerRadius,
              padding: 20,
              marginTop: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.scoreBad,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <AlertCircle size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: theme.typography.weights.label,
                    color: theme.colors.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  Focus Area
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: theme.typography.weights.title,
                    color: theme.colors.text,
                    textTransform: "capitalize",
                  }}
                >
                  {metrics.mostCommonMiss}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.colors.textTertiary,
                    marginTop: 2,
                  }}
                >
                  {metrics.missCount} occurrences
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
