import React from "react";
import Svg, { Circle } from "react-native-svg";

export default function TopLeftBlobs({ width = 320, height = 320, style }) {
  return (
    <Svg style={style} width={width} height={height} viewBox="0 0 220 220">
      <Circle cx="0" cy="0" r="120" fill="#FFEED9" fillOpacity="0.6" />
      <Circle cx="0" cy="0" r="78" fill="#FFDDB8" fillOpacity="0.7" />
    </Svg>
  );
}
