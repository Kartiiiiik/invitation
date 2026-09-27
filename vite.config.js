import { defineConfig } from 'vite';
import { invite, coupleNames, isPlaceholder } from './src/invite.config.js';

// Fills the <head> link-preview tags from invite.config.js so WhatsApp/iMessage
// previews stay in sync with the names without editing index.html.
function inviteMeta() {
  const [a, b] = coupleNames();
  const title = `${a} & ${b} — Wedding Invitation`;
  const description = `You're invited to celebrate the wedding of ${a} & ${b} · 2 December 2026. Tap to open your invitation.`;
  const base = isPlaceholder(invite.siteUrl) ? '' : invite.siteUrl.replace(/\/$/, '');
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return {
    name: 'invite-meta',
    transformIndexHtml(html) {
      return html
        .replaceAll('%INVITE_TITLE%', esc(title))
        .replaceAll('%INVITE_DESC%', esc(description))
        .replaceAll('%INVITE_URL%', esc(base ? `${base}/` : ''))
        .replaceAll('%INVITE_OG_IMAGE%', esc(`${base}/assets/img/og-image.jpg`));
    },
  };
}

export default defineConfig({
  plugins: [inviteMeta()],
  build: { assetsInlineLimit: 0 },
});
