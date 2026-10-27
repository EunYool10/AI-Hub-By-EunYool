import React, { useState } from 'react';
import { ShieldAlert, Check, X, Loader2 } from 'lucide-react';
import { AdminActionType, ActionRouter } from '../lib/actionRouter';

interface ExecutionConfirmationProps {
  actionType: AdminActionType;
  description: string;
  userEmail?: string;
  lang?: 'ko' | 'en';
  onConfirm: () => void;
  onCancel: () => void;
  onSuccess?: (message: string) => void;
  onError?: (errorMessage: string) => void;
  isOverlay?: boolean;
}

export const ExecutionConfirmation: React.FC<ExecutionConfirmationProps> = ({
  actionType,
  description,
  userEmail,
  lang = 'ko',
  onConfirm,
  onCancel,
  onSuccess,
  onError,
  isOverlay = false,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const actionInfo = ActionRouter.getAdminActionInfo(actionType, lang);

  const handleExecute = async () => {
    setIsExecuting(true);
    onConfirm();
    const result = await ActionRouter.executeAdminAction(actionType, userEmail, lang);
    setIsExecuting(false);

    if (result.success) {
      if (onSuccess) onSuccess(result.message);
    } else {
      if (onError) onError(result.message);
    }
  };

  const content = (
    <div className="p-4 bg-surface-2 border border-amber-500/50 rounded-2xl shadow-2xl space-y-3 max-w-md w-full text-left font-sans">
      <div className="flex items-center gap-2.5 border-b border-amber-500/25 pb-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h4 className="font-bold text-amber-200 text-xs">
            {lang === 'ko' ? '⚠ 관리자 실행 승인 확인' : '⚠ Admin Execution Confirmation'}
          </h4>
          <p className="text-[0.6875rem] text-amber-400/80 font-mono">Server Authorization Enforced</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-xs font-bold text-fg flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>{actionInfo.title}</span>
        </div>
        <p className="text-xs text-amber-100/90 leading-relaxed bg-inset p-2.5 rounded-xl border border-amber-500/20">
          {description || (lang === 'ko' ? '시스템 상태가 재설정됩니다. 계속 진행하시겠습니까?' : 'System state will be updated. Do you wish to proceed?')}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              <span>{lang === 'ko' ? '실행 중...' : 'Executing...'}</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{lang === 'ko' ? '실행 승인' : 'Approve & Execute'}</span>
            </>
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={isExecuting}
          className="flex-1 py-2 px-3 bg-fg/10 hover:bg-fg/20 disabled:opacity-50 text-fg-2 hover:text-fg rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border border-line cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>{lang === 'ko' ? '취소' : 'Cancel'}</span>
        </button>
      </div>
    </div>
  );

  if (isOverlay) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        {content}
      </div>
    );
  }

  return content;
};
