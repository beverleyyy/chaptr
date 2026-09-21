import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

/** Decorative mock QR — not a real PayNow code. */
export function PayNowQR({ size = 176 }: { size?: number }) {
  const cells = 21;
  const cell = size / cells;
  const pattern: boolean[][] = [];
  for (let r = 0; r < cells; r++) {
    pattern[r] = [];
    for (let c = 0; c < cells; c++) {
      const finder =
        (r < 7 && c < 7) ||
        (r < 7 && c >= cells - 7) ||
        (r >= cells - 7 && c < 7);
      if (finder) {
        const inOuter = r % (cells) < 7;
        const br = r % 7;
        const bc = c < 7 ? c : c - (cells - 7);
        const edge = br === 0 || br === 6 || bc === 0 || bc === 6;
        const core = br >= 2 && br <= 4 && bc >= 2 && bc <= 4;
        pattern[r][c] = edge || core;
      } else {
        pattern[r][c] = ((r * 3 + c * 7 + r * c) % 5) < 2;
      }
    }
  }

  return (
    <View style={{ width: size, height: size, backgroundColor: '#fff', borderRadius: 4, overflow: 'hidden' }}>
      {pattern.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <View
              key={`${r}-${c}`}
              style={{
                position: 'absolute',
                left: c * cell,
                top: r * cell,
                width: cell,
                height: cell,
                backgroundColor: colors.text,
              }}
            />
          ) : null,
        ),
      )}
    </View>
  );
}
