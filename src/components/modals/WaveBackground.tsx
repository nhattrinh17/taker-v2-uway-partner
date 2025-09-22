import React from "react";
import Svg, { Path } from "react-native-svg";

export default function WaveBackground() {
  return (
    <Svg width="100%" height={200} viewBox="0 0 1440 200">
      <Path
        d="M0,100 Q240,0 480,100 T960,100 T1440,100 V200 H0 Z"
        fill="#4fc3f7"
      />
    </Svg>
  );
}
