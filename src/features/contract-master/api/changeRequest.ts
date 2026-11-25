'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { approvalKeys, submitChangeRequest } from '@/entities/approval';
import type { ChangeRequest } from '@/shared/lib/master-kit/masterKit';

export interface ContractActions {
  /** Sends a contract change to the approvals inbox; resolves with the request number. */
  requestChange: (req: ChangeRequest) => Promise<string>;
}

export function useContractActions(): ContractActions {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: submitChangeRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: approvalKeys.all }),
  });
  const { mutateAsync } = m;
  return useMemo(() => ({ requestChange: (req) => mutateAsync(req).then((r) => r.requestNo) }), [mutateAsync]);
}
