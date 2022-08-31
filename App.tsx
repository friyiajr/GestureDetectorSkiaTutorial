import {
  Canvas,
  Skia,
  Path,
  Circle,
  useValue,
  useSharedValueEffect,
} from '@shopify/react-native-skia';
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  requireNativeComponent,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {rotationHandlerName} from 'react-native-gesture-handler/lib/typescript/handlers/RotationGestureHandler';
import {useSharedValue} from 'react-native-reanimated';

const {PI, sin, cos} = Math;

const {width} = Dimensions.get('window');

const App = () => {
  const size = width - 50;
  const strokeWidth = 20;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const startAngle = PI + PI * 0.2;
  const endAngle = 2 * PI - PI * 0.2;
  const A = PI + PI * 0.4;
  const x1 = cx - r * cos(startAngle);
  const y1 = -r * sin(startAngle) + cy;
  const x2 = cx - r * cos(endAngle);
  const y2 = -r * sin(endAngle) + cy;
  const rawPath = `M ${x1} ${y1} A ${r} ${r} 0 1 0 ${x2} ${y2}`;
  const skiaPath = Skia.Path.MakeFromSVGString(rawPath);

  const movableCx = useSharedValue(x2);
  const movableCy = useSharedValue(y2);

  const previousPositionX = useSharedValue(x2);
  const previousPositionY = useSharedValue(y2);

  const skiaCx = useValue(x2);
  const skiaCy = useValue(y2);

  const gesture = Gesture.Pan()
    .onBegin(({translationX, translationY}) => {
      movableCx.value = previousPositionX.value + translationX;
      movableCy.value = previousPositionY.value + translationY;
    })
    .onUpdate(({translationX, translationY}) => {
      movableCx.value = translationX + previousPositionX.value;
      movableCy.value = translationY + previousPositionY.value;
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

  if (!skiaPath) {
    return <View />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          <Canvas style={styles.canvas}>
            <Path
              path={skiaPath}
              style="stroke"
              strokeWidth={strokeWidth}
              strokeCap="round"
            />
            <Circle cx={skiaCx} cy={skiaCy} r={30} color="green" style="fill" />
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
