/** Splits stored contact message (`Subject: …\n\nbody`) for dashboard preview. */
export function parseLeadMessage(message: string): { subject: string; body: string } {
  const match = message.match(/^Subject:\s*([\s\S]*?)(?:\r?\n\r?\n|$)/);
  if (!match) {
    return { subject: "", body: message.trim() };
  }
  return {
    subject: match[1].trim(),
    body: message.slice(match[0].length).trim(),
  };
}
