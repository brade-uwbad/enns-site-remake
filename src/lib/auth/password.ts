export type PasswordChecks = {
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  valid: boolean;
};

export function checkPassword(password: string): PasswordChecks {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return {
    hasMinLength,
    hasLetter,
    hasNumber,
    valid: hasMinLength && hasLetter && hasNumber,
  };
}
