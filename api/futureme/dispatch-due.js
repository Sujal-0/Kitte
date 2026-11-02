import { runDispatchSweep } from '../../scripts/dispatch-due-letters.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const sweepResult = await runDispatchSweep();
    return res.status(200).json(sweepResult);
  } catch (err) {
    console.error('[API /api/futureme/dispatch-due] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
