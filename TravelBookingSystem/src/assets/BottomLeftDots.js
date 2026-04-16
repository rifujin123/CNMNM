import React from "react";
import Svg, { Circle } from "react-native-svg";

export default function BottomLeftDots({ width = 54, height = 38, style }) {
  return (
    <Svg style={style} width={width} height={height} viewBox="0 0 44 28">
      <Circle cx="4" cy="4" r="4" fill="#FFC98D" fillOpacity="0.55" />
      <Circle cx="20" cy="4" r="4" fill="#FFC98D" fillOpacity="0.55" />
      <Circle cx="36" cy="4" r="4" fill="#FFC98D" fillOpacity="0.55" />
      <Circle cx="4" cy="20" r="4" fill="#FFC98D" fillOpacity="0.55" />
      <Circle cx="20" cy="20" r="4" fill="#FFC98D" fillOpacity="0.55" />
      <Circle cx="36" cy="20" r="4" fill="#FFC98D" fillOpacity="0.55" />
    </Svg>
  );
}
