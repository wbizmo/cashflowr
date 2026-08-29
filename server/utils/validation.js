const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

export const cleanText = (value, maxLength = 255) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

export const validateRegistration = ({ firstName, lastName, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const cleanFirstName = cleanText(firstName, 80);
  const cleanLastName = cleanText(lastName, 80);
  const errors = [];

  if (!cleanFirstName) errors.push("First name is required");
  if (!cleanLastName) errors.push("Last name is required");
  if (!EMAIL_PATTERN.test(normalizedEmail) || normalizedEmail.length > 254) {
    errors.push("Enter a valid email address");
  }
  if (typeof password !== "string" || password.length < 10) {
    errors.push("Password must be at least 10 characters");
  } else {
    if (!/[a-z]/.test(password)) errors.push("Password must include a lowercase letter");
    if (!/[A-Z]/.test(password)) errors.push("Password must include an uppercase letter");
    if (!/\d/.test(password)) errors.push("Password must include a number");
  }

  return {
    valid: errors.length === 0,
    errors,
    value: {
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: normalizedEmail,
      password,
    },
  };
};

export const validateLogin = ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  return {
    valid: EMAIL_PATTERN.test(normalizedEmail) && typeof password === "string" && password.length > 0,
    value: { email: normalizedEmail, password },
  };
};
