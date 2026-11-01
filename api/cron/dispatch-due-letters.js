import { runDispatchSweep } from '../../scripts/dispatch-due-letters.mjs';

export default async function handler(req, res) {
  // Optional cron authorization token check
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers['authorization'] !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized cron trigger' });
  }

  try {
    const result = await runDispatchSweep();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

