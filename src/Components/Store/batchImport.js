/**
 * Envoie `rows` en lots successifs de `batchSize` vers `endpoint`.
 * Appelle `onProgress(pct, batchIndex, totalBatches, totalDone)` après chaque lot.
 * Retourne le rapport agrégé { created, skipped, errors }.
 */
export const BATCH_SIZE = 1000;

export async function sendInBatches(axiosInstance, endpoint, rows, extraBody, onProgress) {
  const batches = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE)
    batches.push(rows.slice(i, i + BATCH_SIZE));

  const report = { created: 0, skipped: 0, errors: [] };

  for (let i = 0; i < batches.length; i++) {
    const res = await axiosInstance.post(endpoint, { rows: batches[i], ...extraBody });
    const r   = res?.data?.report;
    if (r) {
      report.created += r.created  ?? 0;
      report.skipped += r.skipped  ?? 0;
      report.errors.push(...(r.errors ?? []));
    }
    onProgress?.(
      Math.round(((i + 1) / batches.length) * 100),
      i + 1,
      batches.length,
      Math.min((i + 1) * BATCH_SIZE, rows.length),
    );
  }

  return report;
}
