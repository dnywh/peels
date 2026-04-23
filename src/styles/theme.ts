import {
  corners,
  palette,
  rotations,
  spacing,
  transitions,
  typography,
} from "@/styles/tokens";

const cssVar = (name: string) => `var(${name})`;

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
} as const;

export const rawTheme = {
  palette,
  spacing,
  corners,
  rotations,
  transitions,
  typography,
} as const;
