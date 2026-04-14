import React from 'react';
import Svg, { Rect } from 'react-native-svg';

export default function RightTopPills({ width = 110, height = 80, style }) {
  return (
    <Svg style={style} width={width} height={height} viewBox="0 0 110 80">
      <Rect x="8" y="6" width="102" height="10" rx="5" fill="#FFB366" fillOpacity="0.55" />
      <Rect x="18" y="28" width="92" height="10" rx="5" fill="#FFB366" fillOpacity="0.55" />
      <Rect x="30" y="50" width="80" height="10" rx="5" fill="#FFB366" fillOpacity="0.55" />
    </Svg>
  );
}
