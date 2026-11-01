/**
 * Time Letter & Digital Love Letter Share Utilities
 * Encodes/decodes live animated letter links and manages time-capsule lock states.
 */

export function generateLetterShareUrl(state) {
  try {
    const payload = {
      m: state.letterMode || 'future-self',
      to: state.recipient || '',
      em: state.recipientEmail || '',
      from: state.author || '',
      sal: state.salutation || '',
      body: state.letterBody || '',
      sign: state.signOff || '',
      date: state.deliveryDate || '',
      sent: state.sendDate || '',
      loc: state.location || '',
      font: state.fontStyle || 'caveat',
      bg: state.envelopeTheme || 'linen-cream',
      bc: state.envelopeBorderColor || '#B91C1C',
      bs: state.envelopeBorderStyle || 'handdrawn-single',
      flap: state.envelopeFlapStyle || 'triangular',
      seal: state.envelopeCenterSeal || 'ribbon',
      stamp: state.envelopeStamp || 'kitte-cat',
      tl: state.envelopeTopLeft || 'none',
      bl: state.envelopeBottomLeft || 'none',
      br: state.envelopeBottomRight || 'none',
      notice: state.envelopeNoticeText || '',
      erad: state.envelopeBorderRadius !== undefined ? state.envelopeBorderRadius : 16,
      lpbg: state.letterPaperTheme || state.paperTheme || 'parchment-wax',
      lbc: state.letterBorderColor || '#B91C1C',
      lbs: state.letterBorderStyle || 'handdrawn-single',
      lrad: state.letterBorderRadius !== undefined ? state.letterBorderRadius : 8,
      lstamp: state.letterStamp || 'none',
      lseal: state.letterCenterSeal || 'none'
    };

    const jsonStr = JSON.stringify(payload);
    const b64 = btoa(encodeURIComponent(jsonStr));
    const url = new URL(window.location.origin + window.location.pathname);
    url.search = `?view=letter&letter=${b64}`;
    return url.toString();
  } catch (err) {
    console.error('Failed to generate share URL:', err);
    return window.location.href;
  }
}

export function parseLetterShareFromUrl() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const letterParam = urlParams.get('letter');
    if (letterParam) {
      const jsonStr = decodeURIComponent(atob(letterParam));
      return normalizePayload(JSON.parse(jsonStr));
    }

    const hash = window.location.hash;
    if (hash && hash.includes('letter=')) {
      const b64 = hash.split('letter=')[1];
      if (b64) {
        const jsonStr = decodeURIComponent(atob(b64));
        return normalizePayload(JSON.parse(jsonStr));
      }
    }

    return null;
  } catch (err) {
    console.warn('Could not parse letter from URL hash/query:', err);
    return null;
  }
}

function normalizePayload(p) {
  if (!p) return null;
  return {
    letterMode: p.m || 'future-self',
    recipient: p.to || 'Future Me',
    recipientEmail: p.em || '',
    author: p.from || 'Past You',
    salutation: p.sal || 'Dear Future Me,',
    letterBody: p.body || '',
    signOff: p.sign || 'With love,',
    deliveryDate: p.date || '',
    sendDate: p.sent || '',
    location: p.loc || '',
    fontStyle: p.font || 'caveat',
    envelopeTheme: p.bg || 'linen-cream',
    envelopeBorderColor: p.bc || '#B91C1C',
    envelopeBorderStyle: p.bs || 'handdrawn-single',
    envelopeBorderRadius: p.erad !== undefined ? Number(p.erad) : 16,
    envelopeFlapStyle: p.flap || 'triangular',
    envelopeCenterSeal: p.seal || 'ribbon',
    envelopeStamp: p.stamp || 'kitte-cat',
    envelopeTopLeft: p.tl || 'none',
    envelopeBottomLeft: p.bl || 'none',
    envelopeBottomRight: p.br || 'none',
    envelopeNoticeText: p.notice || '',
    letterPaperTheme: p.lpbg || p.pbg || 'parchment-wax',
    paperTheme: p.lpbg || p.pbg || 'parchment-wax',
    letterBorderColor: p.lbc || '#B91C1C',
    letterBorderStyle: p.lbs || 'handdrawn-single',
    letterBorderRadius: p.lrad !== undefined ? Number(p.lrad) : 8,
    letterStamp: p.lstamp || 'none',
    letterCenterSeal: p.lseal || 'none'
  };
}

/**
 * Checks if a time capsule letter is locked based on its delivery date string.
 * Unlocks automatically at the start of the delivery day (00:00:00), or if accessed via email dispatch.
 */
export function isCapsuleLocked(deliveryDateStr) {
  if (!deliveryDateStr) return false;
  try {
    // If opened via email delivery or explicit unlock token
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('src') === 'email' || params.get('unseal') === '1' || params.get('unlocked') === '1') {
        return false;
      }
    }

    const target = new Date(deliveryDateStr);
    if (isNaN(target.getTime())) return false;
    
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    
    return todayMidnight < targetMidnight;
  } catch (_) {
    return false;
  }
}

/**
 * Checks if a letter is locked, considering letterMode (someone-special letters are immediately openable).
 */
export function isLetterLocked(state) {
  if (!state) return false;
  if (state.letterMode === 'someone-special') return false;
  return isCapsuleLocked(state.deliveryDate);
}

/**
 * Calculate remaining days until unlock.
 */
export function getRemainingLockTime(deliveryDateStr) {
  if (!deliveryDateStr) return { isLocked: false, formatted: '' };
  try {
    const target = new Date(deliveryDateStr);
    if (isNaN(target.getTime())) return { isLocked: false, formatted: '' };

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const diff = targetMidnight - todayMidnight;

    if (diff <= 0) {
      return { isLocked: false, formatted: 'Unlocked' };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);

    let formatted = '';
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      formatted = `${years} Year${years > 1 ? 's' : ''}${remainingDays > 0 ? ` • ${remainingDays}d` : ''}`;
    } else if (days > 0) {
      formatted = `${days} Day${days > 1 ? 's' : ''}`;
    } else {
      formatted = 'Today';
    }

    return {
      isLocked: diff > 0,
      days,
      formatted
    };
  } catch (_) {
    return { isLocked: false, formatted: '' };
  }
}
