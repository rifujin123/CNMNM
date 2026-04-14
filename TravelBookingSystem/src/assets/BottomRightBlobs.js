import React from "react";
import Svg, { Circle } from "react-native-svg";

export default function BottomRightBlobs({ width = 240, height = 240, style }) {
  return (
    <Svg style={style} width={width} height={height} viewBox="0 0 170 170">
      <Circle cx="170" cy="170" r="85" fill="#FFEED9" fillOpacity="0.6" />
      <Circle cx="170" cy="170" r="54" fill="#FFDDB8" fillOpacity="0.7" />
    </Svg>
  );
}
