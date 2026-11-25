import { serve } from '@/shared/api';
import { readJson, writeJson } from '@/shared/lib/storage';
import { z } from 'zod';
import { changeRequestInputSchema, changeRequestSchema, type ChangeRequest, type ChangeRequestInput } from '../model/changeRequest';

/** Approvals inbox API. Until the approvals service is connected, requests are kept in this browser. */
const KEY = 'girs.approvals.v1';
const listSchema = z.array(changeRequestSchema);

export function fetchChangeRequests(): Promise<ChangeRequest[]> {
  return serve('approvals/requests', listSchema, () => readJson(KEY, listSchema, []));
}

/** Submits a change request; resolves with it (including its REQ number). */
export async function submitChangeRequest(input: ChangeRequestInput): Promise<ChangeRequest> {
  const valid = changeRequestInputSchema.parse(input);
  const request = await serve('approvals/requests:create', changeRequestSchema, () => ({
    ...valid,
    requestNo: 'REQ-' + String(Date.now()).slice(-6),
    submittedAt: new Date().toISOString(),
  }));
  writeJson(KEY, [request, ...readJson(KEY, listSchema, [])].slice(0, 200));
  return request;
}
