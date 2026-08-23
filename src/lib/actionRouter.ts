export type ActionType = 'WEB_SEARCH' | 'IMAGE_GENERATE' | 'PROMPT_HANDOFF' | 'ADMIN_ACTION';

export type AdminActionType = 'WEBSOCKET_RESET' | 'ERROR_RESET' | 'CACHE_RESET';

export interface ActionPayload {
  type: ActionType;
  data: any;
}

export interface PromptHandoffData {
  name: string;
  description: string;
  url: string;
  prompt: string;
  category?: string;
}

export interface ImageGenerateData {
  prompt: string;
  imageUrl?: string;
}

export interface AdminActionData {
  actionType: AdminActionType;
  description: string;
}

const ALLOWED_ADMIN_ACTIONS: Record<AdminActionType, { endpoint: string; titleKo: string; titleEn: string }> = {
  WEBSOCKET_RESET: {
    endpoint: '/api/admin/websocket/reset',
    titleKo: '웹소켓 연결 재설정',
    titleEn: 'Reset WebSocket Connections',
  },
  ERROR_RESET: {
    endpoint: '/api/admin/errors/reset',
    titleKo: 'JS 오류 로그 초기화',
    titleEn: 'Reset Error Logs',
  },
  CACHE_RESET: {
    endpoint: '/api/admin/cache/reset',
    titleKo: '서버/CDN 캐시 초기화',
    titleEn: 'Reset Server Cache',
  },
};

export class ActionRouter {
  /**
   * Evaluates text for administrative intent keywords
   */
  static detectAdminIntent(query: string): AdminActionType | null {
    const q = query.toLowerCase();
    if (q.includes('웹소켓') || q.includes('websocket')) {
      return 'WEBSOCKET_RESET';
    }
    if (q.includes('오류') || q.includes('error') || q.includes('로그')) {
      return 'ERROR_RESET';
    }
    if (q.includes('캐시') || q.includes('cache')) {
      return 'CACHE_RESET';
    }
    return null;
  }

  /**
   * Gets metadata for an allowed admin action
   */
  static getAdminActionInfo(actionType: AdminActionType, lang: 'ko' | 'en' = 'ko') {
    const info = ALLOWED_ADMIN_ACTIONS[actionType];
    if (!info) return { title: '관리자 조치', endpoint: '' };
    return {
      title: lang === 'ko' ? info.titleKo : info.titleEn,
      endpoint: info.endpoint,
    };
  }

  /**
   * Parses action tags from AI response
   */
  static parseActions(text: string): ActionPayload[] {
    const actions: ActionPayload[] = [];
    const tagRegex = /\[\[ACTION:(PROMPT_HANDOFF|IMAGE_GENERATE|ADMIN_ACTION):([\s\S]*?)\]\]/gi;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(text)) !== null) {
      const type = match[1].toUpperCase() as ActionType;
      const jsonStr = match[2];
      try {
        const data = JSON.parse(jsonStr);
        actions.push({ type, data });
      } catch (err) {
        console.warn('[ActionRouter] Failed to parse action JSON:', err);
      }
    }

    return actions;
  }

  /**
   * Executes an allowlisted Admin Action against backend API with server verification
   */
  static async executeAdminAction(
    actionType: AdminActionType,
    userEmail?: string,
    lang: 'ko' | 'en' = 'ko'
  ): Promise<{ success: boolean; message: string }> {
    const config = ALLOWED_ADMIN_ACTIONS[actionType];
    if (!config) {
      return {
        success: false,
        message: lang === 'ko' ? '허용되지 않은 관리자 조치입니다.' : 'Unauthorized action type.',
      };
    }

    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail || '',
        },
        body: JSON.stringify({ userEmail }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        return {
          success: true,
          message: result.message || (lang === 'ko' ? '관리자 조치가 성공적으로 완료되었습니다.' : 'Executed successfully.'),
        };
      } else {
        return {
          success: false,
          message: result.error || (lang === 'ko' ? '서버 권한 검증에 실패했거나 실행 중 오류가 발생했습니다.' : 'Permission denied or server error.'),
        };
      }
    } catch (error: any) {
      console.error('[ActionRouter] Admin action execution error:', error);
      return {
        success: false,
        message: lang === 'ko' ? '서버와 통신하는 도중 오류가 발생했습니다.' : 'Network connection error.',
      };
    }
  }
}
