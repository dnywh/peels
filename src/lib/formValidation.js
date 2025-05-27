export const validateFirstName = (firstName) => {
  const trimmedName = firstName?.toString().trim();
  if (!trimmedName) {
    return {
      isValid: false,
      error: "You can’t have an empty first name.",
    };
  }
  return {
    isValid: true,
    value: trimmedName,
  };
};

export const FIELD_CONFIGS = {
  firstName: {
    type: "text",
    placeholder: "Your first name or a nickname",
    required: true,
    minLength: 2,
  },
  email: {
    type: "email",
    placeholder: "you@example.com",
    required: true,
  },
  password: {
    type: "password",
    placeholder: "••••••••••••",
    required: true,
    minLength: 6,
  },
};
