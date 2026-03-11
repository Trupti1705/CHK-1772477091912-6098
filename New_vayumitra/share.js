// ── VayuMitra — WhatsApp Share & Copy to Clipboard ──────────

/**
 * Builds the WhatsApp share message text from report details.
 * @param {string} reportId     - Firestore document ID
 * @param {string} pollutionType - e.g. "Factory / Industrial Smoke"
 * @param {string} address       - Street address
 * @param {string} city          - City name
 * @param {string} uid           - Citizen UID
 * @returns {string} Formatted message text
 */
export function formatShareMessage(reportId, pollutionType, address, city, uid) {
  const shortId  = reportId.substring(0, 8).toUpperCase();
  const location = [address, city].filter(Boolean).join(', ') || 'Location not specified';
  const reportUrl = window.location.href;

  return (
    `🌿 *VayuMitra — Pollution Report Filed*\n\n` +
    `🏭 *Type:* ${pollutionType}\n` +
    `📍 *Location:* ${location}\n` +
    `📋 *Report ID:* ${shortId}\n` +
    `🪪 *Citizen UID:* ${uid}\n\n` +
    `⚠️ A pollution violation has been reported to the authorities. ` +
    `If you witness this too, report it at VayuMitra to take action.\n\n` +
    `🔗 Report pollution: ${reportUrl}\n` +
    `_Together we protect our air 🇮🇳_`
  );
}

/**
 * Generates a WhatsApp share URL with pre-filled message.
 * Uses wa.me which is completely free — no API key needed.
 * @param {string} message - The formatted message text
 * @returns {string} WhatsApp share URL
 */
export function generateWhatsAppURL(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/?text=${encoded}`;
}

/**
 * Copies the report text to the user's clipboard.
 * Shows visual feedback on the copy button and a confirmation message.
 */
window.copyReportToClipboard = async function() {
  const btn       = document.getElementById('copy-btn');
  const confirmEl = document.getElementById('share-confirm');
  const text      = btn.dataset.reportText || '';

  try {
    await navigator.clipboard.writeText(text);

    // Button turns green with checkmark
    btn.textContent = '✅ Copied!';
    btn.classList.add('copied');

    // Show confirmation message
    confirmEl.textContent = '📋 Report details copied to clipboard! Paste anywhere to share.';
    confirmEl.classList.add('visible');

    // Reset button after 2.5 seconds
    setTimeout(() => {
      btn.textContent = '📋 Copy Report';
      btn.classList.remove('copied');
    }, 2500);

  } catch (err) {
    btn.textContent = '❌ Failed';
    setTimeout(() => { btn.textContent = '📋 Copy Report'; }, 2000);
  }
};

/**
 * Reveals the share section after a successful report submission.
 * Wires up the WhatsApp button and stores text on the copy button.
 * @param {string} reportId      - Firestore document ID
 * @param {string} pollutionType - Pollution type selected by citizen
 * @param {string} address       - Reported address
 * @param {string} city          - Reported city
 * @param {string} clientUID     - Citizen's UID
 */
export function showShareSection(reportId, pollutionType, address, city, clientUID) {
  const message = formatShareMessage(reportId, pollutionType, address, city, clientUID);
  const waURL   = generateWhatsAppURL(message);

  // Wire up WhatsApp button href
  const waBtn = document.getElementById('whatsapp-share-btn');
  waBtn.href  = waURL;

  // Store message on copy button for clipboard use
  const copyBtn = document.getElementById('copy-btn');
  copyBtn.dataset.reportText = message;
  copyBtn.textContent = '📋 Copy Report';
  copyBtn.classList.remove('copied');

  // Show confirmation with report ID
  const confirmEl = document.getElementById('share-confirm');
  confirmEl.innerHTML = `✅ Report <span class="share-report-id">${reportId.substring(0,8).toUpperCase()}</span> submitted! Share to spread awareness in your community.`;
  confirmEl.classList.add('visible');

  // Reveal share section with slide-in animation
  document.getElementById('share-section').classList.add('visible');
}
