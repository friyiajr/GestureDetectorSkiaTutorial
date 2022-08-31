import {Canvas, Skia, Path} from '@shopify/react-native-skia';
import React from 'react';
import {StyleSheet, View, Text, Dimensions} from 'react-native';

const {PI, sin, cos} = Math;

const {width} = Dimensions.get('window');

const size = width - 50;

const App = () => {
  const strokeWidth = 20;

  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const A = PI + PI * 0.4;
  const startAngle = PI + PI * 0.2;
  const endAngle = 2 * PI - PI * 0.2;

  const x1 = cx - r * cos(startAngle);
  const y1 = -r * sin(startAngle) + cy;
  const x2 = cx - r * cos(endAngle);
  const y2 = -r * sin(endAngle) + cy;

  const rawPath = `M ${x1} ${y1} A ${r} ${r} 0 1 0 ${x2} ${y2}`;

  const skiaPath = Skia.Path.MakeFromSVGString(rawPath);

  if (!skiaPath) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Path
          path={skiaPath}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});

export default App;
