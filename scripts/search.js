=
export function compileRegex(text, ignoreCase) {
  if (text === "") {
    return null;
  }
  try {
    const flags = ignoreCase ? "gi" : "g";
    return new RegExp(text, flags);
  } catch (error) {
    return null;
  }
}
