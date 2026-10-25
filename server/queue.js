// Files d'attente internes : une pour le montage (gourmand en CPU), une pour la publication.
import { jobs } from './store.js';
import { processJob, rerenderJob, step, log } from './pipeline/index.js';
import { publishJob } from './publishers/index.js';

function makeQueue(name) {
  const items = [];
  let running = false;
  async function next() {
    if (running || !items.length) return;
    running = true;
    const { fn, jobId } = items.shift();
    const job = jobs.get(jobId);
    try {
      if (job) await fn(job);
    } catch (err) {
      console.error(`[${name}] ${jobId}:`, err);
      if (job) {
        job.status = 'failed';
        job.error = err.message;
        const runningStep = Object.entries(job.steps).find(([, s]) => s.status === 'running');
        if (runningStep) step(job, runningStep[0], { status: 'error', detail: err.message.slice(0, 160) });
        log(job, `❌ ${err.message}`);
      }
    } finally {
      running = false;
      next();
    }
  }
  return {
    push(jobId, fn) { items.push({ jobId, fn }); next(); },
    has: (jobId) => items.some((i) => i.jobId === jobId),
    get size() { return items.length + (running ? 1 : 0); },
  };
}

const renderQueue = makeQueue('montage');
const publishQueue = makeQueue('publication');

export const enqueueProcess = (jobId) => renderQueue.push(jobId, processJob);
export const enqueueRerender = (jobId, opts) => renderQueue.push(jobId, (job) => rerenderJob(job, opts));
export const enqueuePublish = (jobId, opts = {}) => publishQueue.push(jobId, (job) => publishJob(job, opts));
export const queueSizes = () => ({ montage: renderQueue.size, publication: publishQueue.size });
