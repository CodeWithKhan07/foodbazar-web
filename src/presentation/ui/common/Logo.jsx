import { T } from "../../../domain/constants";

export const Logo = ({ size = 28, light = false }) => (
  <span
    style={{
      fontFamily: "Georgia, serif",
      fontSize: size,
      fontWeight: 700,
      letterSpacing: -0.5,
      lineHeight: 1,
    }}
  >
    <span style={{ color: light ? T.cream : T.brown }}>Food</span>
    <span
      style={{
        color: T.gold,
        fontFamily: "'Noto Nastaliq Urdu', Georgia, serif",
      }}
    >
      بازار
    </span>
  </span>
);
