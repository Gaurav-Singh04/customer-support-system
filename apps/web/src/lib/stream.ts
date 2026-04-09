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

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      callbacks.onText(decoder.decode(value, { stream: true }));
    }
  } catch (err) {
    callbacks.onError?.(err instanceof Error ? err.message : 'Stream error');
  }
}
