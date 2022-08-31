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
import {cos, useSharedValue} from 'react-native-reanimated';
import {canvas2Polar, polar2Canvas} from 'react-native-redash';

const {width} = Dimensions.get('window');

const App = () => {
  const size = width;
  const strokeWidth = 20;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const startAngle = Math.PI + Math.PI * 0.2;
  const endAngle = 2 * Math.PI - Math.PI * 0.2;
  const A = Math.PI + Math.PI * 0.4;
  const x1 = cx - r * Math.cos(startAngle);
  const y1 = -r * Math.sin(startAngle) + cy;
  const x2 = cx - r * Math.cos(endAngle);
  const y2 = -r * Math.sin(endAngle) + cy;
  const rawPath = `M ${x1} ${y1} A ${r} ${r} 0 1 0 ${x2} ${y2}`;
  const skiaPath = Skia.Path.MakeFromSVGString(rawPath);

  const movableCx = useSharedValue(x2);
  const movableCy = useSharedValue(y2);

  const previousPositionX = useSharedValue(x2);
  const previousPositionY = useSharedValue(y2);

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

  const gesture = Gesture.Pan()
    .onBegin(({translationX, translationY}) => {
      // movableCx.value = previousPositionX.value + translationX;
      // console.log('onBegin - movableCx.value', movableCx.value);
      // movableCy.value = previousPositionY.value + translationY;
      // console.log('onBegin - movableCy.value', movableCy.value);
    })
    .onUpdate(({translationX, translationY}) => {
      const oldCanvasX = translationX + previousPositionX.value;
      const oldCanvasY = translationY + previousPositionY.value;

      const xPrime = oldCanvasX - cx;
      const yPrime = -(oldCanvasY - cy);
      const newTheta = Math.atan2(yPrime, xPrime);

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
