import { View, Text, Dimensions, Animated, Image, PanResponder } from "react-native";
import React, { useRef, useState } from "react";
import { Gesture, GestureDetector, Directions, GestureHandlerRootView } from "react-native-gesture-handler";
import { useSharedValue, withTiming, useAnimatedStyle, interpolate, Extrapolate } from "react-native-reanimated";

const WIDTH = Dimensions.get("window").width;
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
  { id: 1, color: "lightblue" },
  { id: 2, color: "lightgreen" },
  { id: 3, color: "orange" },
  { id: 4, color: "brown" },
  { id: 5, color: "red" },
];

export default function App() {
  // Initialize the animated value to manage the position of the view
  const pan = useRef(new Animated.ValueXY()).current;

  const [currentIndex, setCurrentIndex] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gesture) => {
        pan.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (evt, gesture) => {
        if (gesture.dx > 120) {
          Animated.spring(pan, {
            toValue: { x: WIDTH + 100, y: gesture.dy },
            useNativeDriver: true,
          }).start(() => {
            setCurrentIndex(currentIndex + 1);
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gesture.dx < -120) {
          Animated.spring(pan, {
            toValue: { x: -WIDTH - 100, y: gesture.dy },
            useNativeDriver: true,
          }).start(() => {
            setCurrentIndex(currentIndex + 1);
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 4,
          }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-WIDTH / 2, 0, WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const rotateAndTranslate = {
    transform: [{ rotate }, ...pan.getTranslateTransform()],
  };

  const likeOpacity = pan.x.interpolate({
    inputRange: [-WIDTH / 2, 0, WIDTH / 2],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  const dislikeOpacity = pan.x.interpolate({
    inputRange: [-WIDTH / 2, 0, WIDTH / 2],
    outputRange: [1, 0, 0],
    extrapolate: "clamp",
  });

  const nextCardOpacity = pan.x.interpolate({
    inputRange: [-WIDTH / 2, 0, WIDTH / 2],
    outputRange: [1, 0, 1],
    extrapolate: "clamp",
  });

  const nextCardScale = pan.x.interpolate({
    inputRange: [-WIDTH / 2, 0, WIDTH / 2],
    outputRange: [1, 0.8, 1],
    extrapolate: "clamp",
  });

  const stackCardOpacity = (index) => {
    if (index === currentIndex) {
      return 1;
    } else if (index === currentIndex - 1 || index === currentIndex + 1) {
      return 1 - 1 / visibleItems;
    } else {
      return 0;
    }
  }

  const stackCardTranslate = (index) => {
    if (index === currentIndex - 1) {
      return layout.cardsGap;
    } else {
      return 0;
    }
  }

  const stackCardScale = (index) => {
    if (index === currentIndex) {
      return 1;
    } else {
      return 0.96;
    }
  }

  const RenderItem = ({ info, index, totalLength }) => {

    const stackOpacity = stackCardOpacity(index);
    const stackTranslate = stackCardTranslate(index);
    const stackScale = stackCardScale(index);

    const stylez = {
      zIndex: totalLength - index,
      opacity: stackOpacity,
      transform: [
        {translateY: stackTranslate},
        {scale: stackScale},
      ]
    }
    
    if (index < currentIndex) {
      return null;
    } else if (index === currentIndex) {
      return (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            rotateAndTranslate,
            stylez,
            {
              width: layout.width,
              height: layout.height,
              backgroundColor: info.color,
              borderRadius: layout.borderRadius,
              position: "absolute",
              elevation: 3,
            },
          ]}
        >
          <Animated.View
            style={{
              opacity: likeOpacity,
              position: "absolute",
              top: 10,
              left: 30,
              zIndex: 1000,
            }}
          >
            <Image
              source={require("./assets/like.png")}
              style={{ width: 55, height: 55 }}
            />
          </Animated.View>

          <Animated.View
            style={{
              opacity: dislikeOpacity,
              position: "absolute",
              top: 10,
              right: 30,
              zIndex: 1000,
            }}
          >
            <Image
              source={require("./assets/nope.png")}
              style={{ width: 55, height: 55 }}
            />
          </Animated.View>
        </Animated.View>
      );
    } else {
      return (
        <Animated.View
          style={{
            opacity: nextCardOpacity,
            transform: [{ scale: nextCardScale }],
            width: layout.width,
            height: layout.height,
            backgroundColor: info.color,
            borderRadius: 20,
            position: 'absolute',
            elevation: 3
          }}>
          <Animated.View
            style={{
              opacity: 0,
              position: 'absolute',
              top: 10,
              left: 30,
              zIndex: 1000,
            }}>
            <Image
              source={require('./assets/like.png')}
              style={{ width: 55, height: 55 }}
            />
          </Animated.View>
          <Animated.View
            style={{
              opacity: 0,
              position: 'absolute',
              top: 10,
              right: 30,
              zIndex: 1000,
            }}>
            <Image
              source={require('./assets/nope.png')}
              style={{ width: 55, height: 55 }}
            />
          </Animated.View>
        </Animated.View>
      );
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: layout.cardsGap * 8,
      }}
    >
      {colors.map((item, index) => {
        return <RenderItem info={item} key={item.id} index={index} totalLength={colors.length - 1} />;
      }).reverse()}
    </View>
  );
}
