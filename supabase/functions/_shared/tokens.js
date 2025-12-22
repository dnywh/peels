export const colors = {
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
    50: "hsla(36, 26%, 99%, 1)", // Hardcoded in manifest.ts
    80: "#F8F6F3", // hsla(36, 26%, 96%, 1) // Hardcoded in manifest.ts
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
};

export const spacing = {
  sm: "8px",
  md: "16px",
  lg: "24px",
};

export const radii = {
  sm: "4px",
  md: "8px",
  lg: "12px",
};

export const assignments = {
  colors: {
    logo: {
      primary: colors.ochre[800],
      quaternary: colors.ochre[300],
    },
    focus: {
      outline: colors.ocean[500],
    },
    background: {
      top: colors.white[100],
      slight: colors.ochre[50],
      sunk: colors.ochre[80],
      between: colors.ochre[100],
      pit: colors.ochre[150],
      overlay: colors.black[33],
      error: colors.ochre[500_0625],
      map: colors.ocean[200],
      counter: colors.black[15],
    },
    border: {
      light: colors.black[3],
      base: colors.black[6],
      elevated: colors.black[6],
      stark: colors.rock[100],
      collide: colors.rock[50],
      special: colors.ochre[200],
    },
    tab: {
      active: colors.forest[400],
      inactive: colors.rock[300],
      unread: colors.ochre[500],
    },
    status: {
      accepted: colors.forest[400],
      rejected: colors.ochre[500],
    },
    message: {
      sent: {
        background: colors.forest[400],
        text: colors.white[100],
      },
      received: {
        background: colors.ochre[80],
        text: colors.rock[800],
      },
    },
    marker: {
      dot: colors.white[100],
      background: {
        residential: colors.kaki[700],
        community: colors.ochre[500],
        business: colors.ochre[700],
      },
      border: colors.white[100],
    },
    checkbox: {
      border: colors.ochre[800],
      checked: {
        background: colors.ochre[800],
        foreground: colors.white[100],
      },
      unchecked: {
        background: colors.ochre[50],
        foreground: colors.white[100],
      },
    },
    radio: {
      checked: {
        background: colors.ochre[150],
        border: colors.ochre[700],
      },
      unchecked: {
        background: colors.white[100],
        border: colors.rock[50],
      },
      hover: {
        background: colors.ochre[100],
        border: colors.rock[100],
      },
    },
    input: {
      invalid: {
        border: colors.ochre[500],
        text: colors.ochre[600],
      },
      disabled: {
        text: colors.rock[400],
      },
      placeholder: {
        text: colors.rock[400],
      },
    },
    button: {
      primary: {
        background: colors.kaki[700],
        hover: {
          tint: colors.white[100],
          mix: `20%`,
        },
        text: colors.ochre[800],
      },
      secondary: {
        background: colors.white[100],
        hover: {
          tint: colors.white[100],
          mix: `40%`,
        },
        text: colors.ochre[800],
      },
      send: {
        background: colors.ochre[800],
        hover: {
          tint: colors.ochre[800],
          mix: `60%`,
        },
        text: colors.white[100],
      },
      danger: {
        background: colors.white[100],
        hover: {
          tint: colors.white[100],
          mix: `20%`,
        },
        text: colors.ochre[600],
      },
      disabled: {
        background: colors.rock[50],
        text: colors.rock[400],
      },
    },
    text: {
      primary: colors.ochre[800],
      secondary: colors.rock[800],
      tertiary: colors.rock[400],
      link: colors.ochre[700],
      counter: colors.rock[100],
      overlay: colors.white[100],
      // Deprecate above in favour of below
      ui: {
        primary: colors.rock[900],
        secondary: colors.rock[800],
        tertiary: colors.rock[700],
        quaternary: colors.rock[600],
        quinary: colors.rock[400],
        emptyState: colors.rock[300],
        error: colors.ochre[600],
      },
      brand: {
        primary: colors.ochre[800],
        quaternary: colors.ochre[300],
      },
    },
  },
  spacing: {
    unit: "0.5rem", // 8px
    gap: {
      desktop: "1.5rem",
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
  },
  rotations: {
    avatar: "-3deg",
  },
  corners: {
    base: "1rem", // 16px
    avatar: {
      small: "0.375rem",
      large: "0.5rem",
    },
  },
};
