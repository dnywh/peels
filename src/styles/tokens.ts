export const palette = {
  white: {
    100: "hsla(0, 0%, 100%, 1)",
  },
  black: {
    3: "hsla(0, 0%, 0%, 0.03)",
    6: "hsla(0, 0%, 0%, 0.06)",
    15: "hsla(0, 0%, 0%, 0.15)",
    33: "hsla(0, 0%, 0%, 0.33)",
    100: "hsla(0, 0%, 0%, 1)",
  },
  rock: {
    50: "hsla(0, 4%, 95%, 1)",
    100: "hsla(37, 5%, 83%, 1)",
    300: "hsla(38, 5%, 71%, 1)",
    400: "hsla(37, 5%, 61%, 1)",
    600: "hsla(37, 5%, 54%, 1)",
    700: "hsla(37, 5%, 40%, 1)",
    800: "hsla(37, 5%, 25%, 1)",
    900: "hsla(37, 5%, 12%, 1)",
  },
  forest: {
    400: "hsla(81, 95%, 36%, 1)",
  },
  ocean: {
    200: "hsla(192, 75%, 91%, 1)",
    500: "hsla(193, 77%, 43%, 1)",
  },
  ochre: {
    50: "hsla(36, 26%, 99%, 1)",
    80: "hsla(36, 26%, 96%, 1)",
    100: "hsla(22, 35%, 96%, 1)",
    150: "hsla(22, 35%, 95%, 1)",
    200: "hsla(22, 35%, 91%, 1)",
    300: "hsla(22, 26%, 85%, 1)",
    500: "hsla(22, 87%, 50%, 1)",
    500_0625: "hsla(22, 87%, 50%, 0.0625)",
    600: "hsla(22, 87%, 44%, 1)",
    700: "hsla(22, 97%, 25%, 1)",
    800: "hsla(22, 100%, 14%, 1)",
  },
  kaki: {
    600: "hsla(48, 97%, 64%, 1)",
    700: "hsla(47, 100%, 50%, 1)",
    800: "hsla(47, 100%, 46%, 1)",
  },
} as const;

export const spacing = {
  unit: "0.5rem",
  gap: {
    page: {
      md: "5rem",
      lg: "12vh",
    },
    section: {
      md: "2.15rem",
      lg: "2.75rem",
    },
    sectionInner: "0.625rem",
    desktop: "1.5rem",
  },
  container: {
    maxWidth: {
      media: "720px",
      text: "640px",
      aside: "512px",
    },
    textOpticalWidth: "36ch",
  },
  forms: {
    maxWidth: "36rem",
    gap: {
      field: "0.5rem",
    },
  },
  tabBar: {
    maxWidth: "26rem",
    marginX: "1.5rem",
    marginBottom: "0.75rem",
    spaceFor: "6rem",
  },
  dropdownMenu: {
    gap: "4px",
  },
} as const;

export const corners = {
  thumbnail: "0.375rem",
  base: "1rem",
  avatar: {
    small: "0.375rem",
    large: "0.5rem",
  },
} as const;

export const rotations = {
  avatar: "-3deg",
} as const;

export const transitions = {
  textColor: "color 150ms ease-in-out",
  svgColor: "stroke 150ms ease-in-out",
} as const;

export const typography = {
  size: {
    p: {
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
    },
  },
  lineHeight: {
    h: "115%",
    p: {
      sm: "145%",
      md: "155%",
      lg: "160%",
    },
  },
} as const;

export const themeMeta = {
  manifestBackground: palette.ochre[80],
} as const;
