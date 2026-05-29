export async function loadMessages(locale: string) {
  if (locale === "pt") {
    return (await import("../../messages/pt.json")).default;
  }
  return (await import("../../messages/en.json")).default;
}
