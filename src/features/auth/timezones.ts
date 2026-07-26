/**
 * IANA timezone list for the registration picker.
 * TODO: swap for the exact same picker component HR Dashboard uses in its
 * onboarding once that component can be copied over from the repo.
 */
export function getTimezones(): string[] {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }
  return ["UTC", "Asia/Ho_Chi_Minh", "Asia/Singapore", "Europe/London", "America/New_York"];
}
