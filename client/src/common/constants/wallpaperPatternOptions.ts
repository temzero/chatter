export interface WallpaperPatternOption {
  id: string | null;
  name: string;
  background: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
}

// All patterns using CSS variables - no theme-specific duplicates!
export const wallpaperPatternOptions: WallpaperPatternOption[] = [
  // Default option
  {
    id: null,
    name: "None",
    background: "transparent",
  },

  // Dots pattern (uses CSS variables for colors)
  {
    id: "pattern_dots",
    name: "Dots",
    background: `
      radial-gradient(
        circle at 1.6px 1.6px,
        var(--text-color, rgba(0, 0, 0, 0.2)) 1.5px,
        transparent 1.7px
      )
    `,
    backgroundSize: "30px 30px",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_sand",
    name: "Sand",
    background: `
    radial-gradient(
      circle at 0.8px 0.8px,
      var(--text-color, rgba(0, 0, 0, 0.18)) 1px,
      transparent 0.9px
    )
  `,
    backgroundSize: "8px 8px",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_crosshatch",
    name: "Crosshatch",
    background: `
      repeating-linear-gradient(
        45deg,
        var(--text-color, rgba(0, 0, 0, 0.08)),
        var(--text-color, rgba(0, 0, 0, 0.08)) 1px,
        transparent 1px,
        transparent 12px
      ),
      repeating-linear-gradient(
        -45deg,
        var(--text-color, rgba(0, 0, 0, 0.08)),
        var(--text-color, rgba(0, 0, 0, 0.08)) 1px,
        transparent 1px,
        transparent 12px
      )
    `,
    backgroundRepeat: "repeat",
  },

  // Pinstripes Horizontal
  {
    id: "pattern_pinstripes_horizontal",
    name: "Pinstripes (Horizontal)",
    background: `
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 9px,
        var(--text-color, rgba(150, 150, 150, 0.3)) 9px,
        var(--text-color, rgba(150, 150, 150, 0.3)) 10px
      )
    `,
    backgroundSize: "50px 50px",
    backgroundRepeat: "repeat",
  },

  // Pinstripes Vertical
  {
    id: "pattern_pinstripes_vertical",
    name: "Pinstripes (Vertical)",
    background: `
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 9px,
        var(--text-color, rgba(150, 150, 150, 0.3)) 9px,
        var(--text-color, rgba(150, 150, 150, 0.3)) 10px
      )
    `,
    backgroundSize: "50px 50px",
    backgroundRepeat: "repeat",
  },

  // Horizontal Stripes
  {
    id: "pattern_horizontal_stripes",
    name: "Horizontal Stripes",
    background: `
      repeating-linear-gradient(
        0deg,
        var(--text-color, rgba(0, 0, 0, 0.06)),
        var(--text-color, rgba(0, 0, 0, 0.06)) 10px,
        transparent 10px,
        transparent 20px
      )
    `,
    backgroundRepeat: "repeat",
  },

  // Diagonal Stripes
  {
    id: "pattern_diagonal_stripes",
    name: "Diagonal Stripes",
    background: `
      repeating-linear-gradient(
        45deg,
        var(--text-color, rgba(0, 0, 0, 0.06)),
        var(--text-color, rgba(0, 0, 0, 0.06)) 10px,
        transparent 10px,
        transparent 20px
      )
    `,
    backgroundRepeat: "repeat",
  },

  // Carbon Fiber
  {
    id: "pattern_carbon_fiber",
    name: "Carbon Fiber",
    background: `
      linear-gradient(45deg, var(--text-color, #f5f5f5) 25%, transparent 25%, transparent 75%, var(--text-color, #f5f5f5) 75%),
      linear-gradient(45deg, var(--text-color, #f5f5f5) 25%, transparent 25%, transparent 75%, var(--text-color, #f5f5f5) 75%)
    `,
    backgroundSize: "50px 50px, 50px 50px",
    backgroundPosition: "0 0, 25px 25px",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_diamond",
    name: "Diamond",
    background: `
    linear-gradient(
      45deg,
      var(--text-color, #f5f5f5) 25%,
      transparent 25%,
      transparent 75%,
      var(--text-color, #f5f5f5) 75%
    ),
    linear-gradient(
      135deg,
      var(--text-color, #f5f5f5) 25%,
      transparent 25%,
      transparent 75%,
      var(--text-color, #f5f5f5) 75%
    )
  `,
    backgroundSize: "50px 50px",
    backgroundPosition: "0 0, 25px 25px",
    backgroundRepeat: "repeat",
  },

  // Chevron
  {
    id: "pattern_chevron",
    name: "Chevron",
    background: `
      linear-gradient(45deg, var(--text-color, #e8e8e8) 25%, transparent 25%, transparent 75%, var(--text-color, #e8e8e8) 75%),
      linear-gradient(-45deg, var(--text-color, #e8e8e8) 25%, transparent 25%, transparent 75%, var(--text-color, #e8e8e8) 75%)
    `,
    backgroundSize: "50px 50px",
    backgroundPosition: "0 0, 0 20px",
    backgroundRepeat: "repeat",
  },

  {
    id: "pattern_diamond_grid",
    name: "Diamond Grid",
    background: `
      linear-gradient(
        45deg,
        var(--text-color, rgba(0, 0, 0, 0.07)) 25%,
        transparent 25%,
        transparent 75%,
        var(--text-color, rgba(0, 0, 0, 0.07)) 75%
      )
    `,
    backgroundSize: "40px 40px",
    backgroundRepeat: "repeat",
  },
  // Zig Zag
  {
    id: "pattern_zigzag",
    name: "Zig Zag",
    background: `
    linear-gradient(
      135deg,
      transparent 75%,
      var(--text-color, rgba(0, 0, 0, 0.08)) 75%
    ),
    linear-gradient(
      225deg,
      transparent 75%,
      var(--text-color, rgba(0, 0, 0, 0.08)) 75%
    )
  `,
    backgroundSize: "24px 24px",
    backgroundPosition: "0 0, 12px 12px",
    backgroundRepeat: "repeat",
  },

  {
    id: "pattern_hex_grid",
    name: "Hex Grid",
    background: `
    linear-gradient(
      30deg,
      var(--text-color, rgba(0, 0, 0, 0.08)) 12%,
      transparent 12.5%,
      transparent 87%,
      var(--text-color, rgba(0, 0, 0, 0.08)) 87.5%
    ),
    linear-gradient(
      150deg,
      var(--text-color, rgba(0, 0, 0, 0.08)) 12%,
      transparent 12.5%,
      transparent 87%,
      var(--text-color, rgba(0, 0, 0, 0.08)) 87.5%
    ),
    linear-gradient(
      90deg,
      var(--text-color, rgba(0, 0, 0, 0.08)) 2%,
      transparent 2.5%,
      transparent 97%,
      var(--text-color, rgba(0, 0, 0, 0.08)) 97.5%
    )
  `,
    backgroundSize: "40px 24px",
    backgroundRepeat: "repeat",
  },
  // Isometric
  {
    id: "pattern_isometric",
    name: "Isometric",
    background: `
      linear-gradient(30deg, var(--text-color, #e6e6e6) 12.5%, transparent 12.5%, transparent 87.5%, var(--text-color, #e6e6e6) 87.5%),
      linear-gradient(150deg, var(--text-color, #e6e6e6) 12.5%, transparent 12.5%, transparent 87.5%, var(--text-color, #e6e6e6) 87.5%),
      linear-gradient(30deg, var(--text-color, #e6e6e6) 12.5%, transparent 12.5%, transparent 87.5%, var(--text-color, #e6e6e6) 87.5%),
      linear-gradient(150deg, var(--text-color, #e6e6e6) 12.5%, transparent 12.5%, transparent 87.5%, var(--text-color, #e6e6e6) 87.5%),
      linear-gradient(60deg, var(--pattern-grid-fill, #ededed) 25%, transparent 25%, transparent 75%, var(--pattern-grid-fill, #ededed) 75%)
    `,
    backgroundSize: "80px 140px",
    backgroundPosition: "0 0, 0 0, 40px 70px, 40px 70px, 0 0",
    backgroundRepeat: "repeat",
  },
  {
    id: "pattern_topographic",
    name: "Topographic",
    background: `
    repeating-radial-gradient(
      circle at 30% 40%,
      var(--text-color, rgba(0, 0, 0, 0.07)),
      var(--text-color, rgba(0, 0, 0, 0.07)) 1px,
      transparent 1px,
      transparent 8px
    )
  `,
    backgroundSize: "120px 120px",
    backgroundRepeat: "repeat",
  },

  {
    id: "pattern_moon_tiles",
    name: "Moon Tiles",
    background: `
    radial-gradient(
      ellipse farthest-corner at 10px 10px,
      var(--text-color, rgba(0, 0, 0, 0.18)),
      var(--text-color, rgba(0, 0, 0, 0.18)) 50%,
      transparent 50%
    )
  `,
    backgroundSize: "10px 10px",
    backgroundRepeat: "repeat",
  },

  {
    id: "pattern_waves",
    name: "Waves",
    background: `
    repeating-radial-gradient(
      circle at 100% 100%,
      var(--text-color, rgba(0, 0, 0, 0.12)),
      var(--text-color, rgba(0, 0, 0, 0.12)) 2px,
      transparent 2.5px,
      transparent 5px
    )
  `,
    backgroundSize: "50px 50px",
    backgroundRepeat: "repeat",
  },
];
