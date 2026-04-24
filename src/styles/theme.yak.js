const palette = {
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
};

const spacing = {
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
};

const corners = {
  thumbnail: "0.375rem",
  base: "1rem",
  avatar: {
    small: "0.375rem",
    large: "0.5rem",
  },
};

const rotations = {
  avatar: "-3deg",
};

const transitions = {
  textColor: "color 150ms ease-in-out",
  svgColor: "stroke 150ms ease-in-out",
};

const typography = {
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
};

const cssVar = (name) => `var(${name})`;

export const theme = {
  colors: {
    logo: {
      primary: cssVar("--color-logo-primary"),
      quaternary: cssVar("--color-logo-quaternary"),
    },
    focus: {
      outline: cssVar("--color-focus-outline"),
    },
    background: {
      top: cssVar("--color-bg-top"),
      slight: cssVar("--color-bg-slight"),
      sunk: cssVar("--color-bg-sunk"),
      between: cssVar("--color-bg-between"),
      pit: cssVar("--color-bg-pit"),
      overlay: cssVar("--color-bg-overlay"),
      error: cssVar("--color-bg-error"),
      map: cssVar("--color-bg-map"),
      counter: cssVar("--color-bg-counter"),
    },
    border: {
      light: cssVar("--color-border-light"),
      base: cssVar("--color-border-base"),
      elevated: cssVar("--color-border-elevated"),
      stark: cssVar("--color-border-stark"),
      collide: cssVar("--color-border-collide"),
      special: cssVar("--color-border-special"),
      focus: cssVar("--color-focus-outline"),
    },
    tab: {
      active: cssVar("--color-tab-active"),
      inactive: cssVar("--color-tab-inactive"),
      unread: cssVar("--color-tab-unread"),
    },
    status: {
      accepted: cssVar("--color-status-accepted"),
      rejected: cssVar("--color-status-rejected"),
    },
    message: {
      sent: {
        background: cssVar("--color-message-sent-bg"),
        text: cssVar("--color-message-sent-text"),
      },
      received: {
        background: cssVar("--color-message-received-bg"),
        text: cssVar("--color-message-received-text"),
      },
    },
    marker: {
      dot: cssVar("--color-marker-dot"),
      background: {
        residential: cssVar("--color-marker-residential"),
        community: cssVar("--color-marker-community"),
        business: cssVar("--color-marker-business"),
      },
      border: cssVar("--color-marker-border"),
    },
    checkbox: {
      border: cssVar("--color-checkbox-border"),
      checked: {
        background: cssVar("--color-checkbox-checked-bg"),
        foreground: cssVar("--color-checkbox-checked-fg"),
      },
      unchecked: {
        background: cssVar("--color-checkbox-unchecked-bg"),
        foreground: cssVar("--color-checkbox-unchecked-fg"),
      },
    },
    radio: {
      checked: {
        background: cssVar("--color-radio-checked-bg"),
        border: cssVar("--color-radio-checked-border"),
      },
      unchecked: {
        background: cssVar("--color-radio-unchecked-bg"),
        border: cssVar("--color-radio-unchecked-border"),
      },
      hover: {
        background: cssVar("--color-radio-hover-bg"),
        border: cssVar("--color-radio-hover-border"),
      },
    },
    input: {
      invalid: {
        border: cssVar("--color-input-invalid-border"),
        text: cssVar("--color-input-invalid-text"),
      },
      disabled: {
        text: cssVar("--color-input-disabled-text"),
      },
      placeholder: {
        text: cssVar("--color-input-placeholder-text"),
      },
    },
    button: {
      primary: {
        background: cssVar("--color-button-primary-bg"),
        hover: {
          tint: cssVar("--color-button-primary-hover-tint"),
          mix: cssVar("--color-button-primary-hover-mix"),
        },
        text: cssVar("--color-button-primary-text"),
      },
      secondary: {
        background: cssVar("--color-button-secondary-bg"),
        hover: {
          tint: cssVar("--color-button-secondary-hover-tint"),
          mix: cssVar("--color-button-secondary-hover-mix"),
        },
        text: cssVar("--color-button-secondary-text"),
      },
      send: {
        background: cssVar("--color-button-send-bg"),
        hover: {
          tint: cssVar("--color-button-send-hover-tint"),
          mix: cssVar("--color-button-send-hover-mix"),
        },
        text: cssVar("--color-button-send-text"),
      },
      danger: {
        background: cssVar("--color-button-danger-bg"),
        hover: {
          tint: cssVar("--color-button-danger-hover-tint"),
          mix: cssVar("--color-button-danger-hover-mix"),
        },
        text: cssVar("--color-button-danger-text"),
      },
      disabled: {
        background: cssVar("--color-button-disabled-bg"),
        text: cssVar("--color-button-disabled-text"),
      },
    },
    text: {
      primary: cssVar("--color-text-primary"),
      secondary: cssVar("--color-text-secondary"),
      tertiary: cssVar("--color-text-tertiary"),
      link: cssVar("--color-text-link"),
      counter: cssVar("--color-text-counter"),
      overlay: cssVar("--color-text-overlay"),
      ui: {
        primary: cssVar("--color-text-ui-primary"),
        secondary: cssVar("--color-text-ui-secondary"),
        tertiary: cssVar("--color-text-ui-tertiary"),
        quaternary: cssVar("--color-text-ui-quaternary"),
        quinary: cssVar("--color-text-ui-quinary"),
        emptyState: cssVar("--color-text-ui-empty-state"),
        error: cssVar("--color-text-ui-error"),
      },
      brand: {
        primary: cssVar("--color-text-brand-primary"),
        quaternary: cssVar("--color-text-brand-quaternary"),
      },
    },
  },
  spacing,
  corners,
  rotations,
  transitions,
  typography,
};

export const rawTheme = {
  palette,
  spacing,
  corners,
  rotations,
  transitions,
  typography,
};
