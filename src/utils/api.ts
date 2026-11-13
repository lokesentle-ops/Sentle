export async function postJson<T = Record<string, unknown>>(
  url: string,
  payload: unknown
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  const trimmed = rawText.trim();
  const looksLikeHtml =
    trimmed.startsWith("<") ||
    (response.headers.get("content-type") || "").includes("text/html");

  if (looksLikeHtml) {
    if (response.status === 403) {
      throw new Error(
        `Access to ${url} was blocked by the preview proxy (HTTP 403 HTML). Please reload the page to refresh your session, or ensure you are using the active Development Preview URL.`
      );
    }
    throw new Error(
      `The server returned an HTML response (HTTP ${response.status}) instead of JSON for ${url}. Please reload the page or verify the backend server is running.`
    );
  }

  let data: Record<string, unknown> = {};
  if (trimmed) {
    try {
      data = JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      throw new Error(
        `Unexpected non-JSON response from server (HTTP ${response.status}).`
      );
    }
  }

  if (!response.ok) {
    const errMsg =
      typeof data.error === "string" && data.error.trim()
        ? data.error
        : `Request failed with HTTP ${response.status}.`;
    throw new Error(errMsg);
  }

  return data as T;
}
