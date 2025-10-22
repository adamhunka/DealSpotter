const JSON_HEADERS = { "Content-Type": "application/json" };

export function jsonResponse<T>(data: T, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}
