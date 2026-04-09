interface StreamCallbacks {
  onText: (text: string) => void;
  onError?: (error: string) => void;
}

export async function parseDataStream(
  response: Response,
  callbacks: StreamCallbacks,
): Promise<void> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const type = line.slice(0, colonIdx);
      const payload = line.slice(colonIdx + 1);

      if (type === '0') {
        try {
          callbacks.onText(JSON.parse(payload));
        } catch {
          /* ignore malformed text chunks */
        }
      } else if (type === '3' || type === 'e') {
        try {
          callbacks.onError?.(JSON.parse(payload));
        } catch {
          callbacks.onError?.('Stream error');
        }
      }
    }
  }
}
