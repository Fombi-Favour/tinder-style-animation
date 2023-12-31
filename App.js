import React, { useRef, useState, useEffect } from "react";
import { Text, View, StyleSheet, Dimensions} from "react-native";
import {
  FlingGestureHandler,
  Gesture,
  GestureDetector,
  Directions,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";

const WIDTH = Dimensions.get("window").width;
// const HEIGHT = Dimensions.get("window").height;
const _size = WIDTH * 0.9;
const duration = 300;
const visibleItems = 4;
const layout = {
  borderRadius: 20,
  width: _size,
  height: _size * 1.27,
  spacing: 12,
  cardsGap: 22,
};

const colors = [
  { id: 1, color: "blue" },
  { id: 2, color: "green" },
  { id: 3, color: "yellow" },
  { id: 4, color: "orange" },
  { id: 5, color: "red" },
];

const Card = ({ info, index, activeIndex, totalLength }) => {
  const stylez = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      zIndex: totalLength - index,
      opacity: interpolate(activeIndex.value,
        [index - 1, index, index + 1],
        [1 - 1 / visibleItems, 1, 0]
      ),
      transform: [
        {
          translateY: interpolate(activeIndex.value,
            [index - 1, index, index + 1],
            [layout.cardsGap, 0, 0]
          )
        },
        {
          scale: interpolate(activeIndex.value,
            [index - 1, index, index + 1],
            [0.96, 1, 1]
          )
      }]
    }
  })

  return (
    <Animated.View
      style={[styles.card, stylez, { backgroundColor: info.color, }]}
    ></Animated.View>
  );
};

export default function App() {
  const activeIndex = useSharedValue(0);
  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onStart(() => {
      if (activeIndex.value === 0) {
        return;
      }
      activeIndex.value = withTiming(activeIndex.value - 1, { duration });
      console.log("fling left");
    });

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onStart(() => {
      if (activeIndex.value === colors.length) {
        return;
      }
      activeIndex.value = withTiming(activeIndex.value + 1, { duration });
      console.log("fling right");
    });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={Gesture.Exclusive(flingLeft, flingRight)}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            marginBottom: layout.cardsGap * 6,
          }}
        >
          {colors.map((item, index) => {
            return (
              <Card
                info={item}
                key={item.id}
                index={index}
                activeIndex={activeIndex}
                totalLength={colors.length - 1}
              />
            );
          })}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  card: {
    height: layout.height,
    width: layout.width,
    borderRadius: layout.borderRadius,
    padding: layout.spacing,
  },
});
