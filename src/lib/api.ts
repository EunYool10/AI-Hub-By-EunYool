export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          error: data?.error || `요청 실패 (${res.status})`,
        };
      }
      return { ok: true, status: res.status, data };
    } else {
      // Received non-JSON response (e.g. HTML error page or text)
      const text = await res.text();
      console.warn(`[API WARNING] Expected JSON from ${url} but received non-JSON (${contentType}):`, text.slice(0, 100));
      return {
        ok: false,
        status: res.status,
        error: res.ok
          ? '서버 응답 형식이 올바르지 않습니다.'
          : `서버 오류가 발생했습니다 (${res.status}).`,
      };
    }
  } catch (err: any) {
    console.error(`[API ERROR] ${url}`, err);
    return {
      ok: false,
      status: 0,
      error: err.message || '네트워크 연결 오류가 발생했습니다.',
    };
  }
}
