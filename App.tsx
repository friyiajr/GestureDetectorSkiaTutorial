import {
  Canvas,
  Circle,
  Path,
  Rect,
  Skia,
  useSharedValueEffect,
  useValue,
} from '@shopify/react-native-skia';
import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {canvas2Polar, polar2Canvas} from 'react-native-redash';

const {width, height} = Dimensions.get('window');

const App = () => {
  const size = width;
  const strokeWidth = 20;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2 - 40;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const x1 = cx - r * Math.cos(startAngle);
  const y1 = -r * Math.sin(startAngle) + cy;
  const x2 = cx - r * Math.cos(endAngle);
  const y2 = -r * Math.sin(endAngle) + cy;
  const rawPath = `M ${x1} ${y1} A ${r} ${r} 0 1 0 ${x2} ${y2}`;
  const rawForegroundPath = `M ${x2} ${y2} A ${r} ${r} 1 0 1 ${x1} ${y1}`;
  const skiaBackgroundPath = Skia.Path.MakeFromSVGString(rawPath);
  const skiaForegroundPath = Skia.Path.MakeFromSVGString(rawForegroundPath);

  const movableCx = useSharedValue(x2);
  const movableCy = useSharedValue(y2);

  const previousPositionX = useSharedValue(x2);
  const previousPositionY = useSharedValue(y2);

  const percentComplete = useSharedValue(0);

  const {radius} = canvas2Polar(
    {
      x: x2,
      y: y2,
    },
    {
      x: cx,
      y: cy,
    },
  );

  const skiaCx = useValue(x2);
  const skiaCy = useValue(y2);
  const skiaPercentComplete = useValue(0);

  const gesture = Gesture.Pan()
    .onUpdate(({translationX, translationY, absoluteX}) => {
      const oldCanvasX = translationX + previousPositionX.value;
      const oldCanvasY = translationY + previousPositionY.value;

      const xPrime = oldCanvasX - cx;
      const yPrime = -(oldCanvasY - cy);
      const rawTheta = Math.atan2(yPrime, xPrime);

      let newTheta;

      if (absoluteX < width / 2 && rawTheta < 0) {
        newTheta = Math.PI;
      } else if (absoluteX > width / 2 && rawTheta <= 0) {
        newTheta = 0;
      } else {
        newTheta = rawTheta;
      }

      const percent = 1 - newTheta / Math.PI;

      percentComplete.value = percent;

      const newCoords = polar2Canvas(
        {
          theta: newTheta,
          radius,
        },
        {
          x: cx,
          y: cy,
        },
      );

      movableCx.value = newCoords.x;
      movableCy.value = newCoords.y;
    })
    .onEnd(() => {
      previousPositionX.value = movableCx.value;
      previousPositionY.value = movableCy.value;
    });

  useSharedValueEffect(() => {
    skiaCx.current = movableCx.value;
  }, movableCx);

  useSharedValueEffect(() => {
    skiaCy.current = movableCy.value;
  }, movableCy);

  useSharedValueEffect(() => {
    skiaPercentComplete.current = percentComplete.value;
  }, percentComplete);

  const style = useAnimatedStyle(() => {
    return {height: 200, width: 300, opacity: percentComplete.value};
  }, [percentComplete]);

  if (!skiaBackgroundPath || !skiaForegroundPath) {
    return <View />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          <View
            style={{
              flex: 2,
              backgroundColor: 'black',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Animated.Image
              source={require('./ghost.png')}
              style={style}
              resizeMode="center"
            />
          </View>
          <Canvas style={styles.canvas}>
            <Rect x={0} y={0} width={width} height={height} color="black" />
            <Path
              path={skiaBackgroundPath}
              style="stroke"
              strokeWidth={strokeWidth}
              strokeCap="round"
              color={'grey'}
            />
            <Path
              path={skiaForegroundPath}
              style="stroke"
              strokeWidth={strokeWidth}
              strokeCap="round"
              color={'orange'}
              start={0}
              end={skiaPercentComplete}
            />
            <Circle
              cx={skiaCx}
              cy={skiaCy}
              r={20}
              color="orange"
              style="fill"
            />
            <Circle cx={skiaCx} cy={skiaCy} r={15} color="white" style="fill" />
          </Canvas>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
  cursor: {
    backgroundColor: 'green',
  },
});

export default App;
