export function isEmail(email: string): boolean {
  if (!email || email.trim() === "") return false;
  const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!email.match(validEmailRegex)) return false;
  return true;
}

/**
 * 
 * Check if a string isn't null or empty
 * If minLength is set, the value should have atleast that minLength length
 * 
 * @param value 
 * @param minLength
 * @returns boolean
 */
export function isValidString(value: string, minLength?: number): boolean {
  if (!value || value.trim() === "") return false;
  if (minLength && value.trim().length < minLength) return false;

  return true;
}