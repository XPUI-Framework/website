(() => {
  const root = document.documentElement;
  const read = () => { try { return localStorage.getItem('theme'); } catch { return null; } };
  const save = (t) => { try { t === 'system' ? localStorage.removeItem('theme') : localStorage.setItem('theme', t); } catch {} };
  const apply = (t) => { if (t === 'system') delete root.dataset.theme; else root.dataset.theme = t; };
  let theme = ['light', 'dark'].includes(read()) ? read() : 'system';
  apply(theme);

  addEventListener('DOMContentLoaded', () => {
    const group = document.getElementById('site-theme');
    if (group) {
      const buttons = [...group.querySelectorAll('[data-theme-choice]')];
      const show = () => buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeChoice === theme)));
      buttons.forEach((b) => b.addEventListener('click', () => { theme = b.dataset.themeChoice; apply(theme); save(theme); show(); }));
      group.hidden = false;
      show();
    }

    // Each sidebar opens where you are, not at the top; the page has one for the rail and one for the menu.
    for (const current of document.querySelectorAll('.sidebar a[aria-current="page"]')) {
      const rail = current.closest('nav')?.parentElement;
      if (rail && rail.scrollHeight > rail.clientHeight) {
        rail.scrollTop = current.offsetTop - rail.clientHeight / 2 + current.offsetHeight / 2;
      }
    }

    // The contents follow the reader: the heading nearest the top of the page is the current one.
    const links = new Map([...document.querySelectorAll('.toc a[href^="#"]')].map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const headings = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    if (headings.length) {
      let current;
      const mark = () => {
        const reading = headings.filter((h) => h.getBoundingClientRect().top < 120).at(-1) ?? headings[0];
        if (reading === current) return;
        current = reading;
        for (const [id, link] of links) link.toggleAttribute('aria-current', id === reading.id);
      };
      mark();
      addEventListener('scroll', mark, { passive: true });
      addEventListener('resize', mark, { passive: true });
    }

    for (const block of document.querySelectorAll('pre')) {
      const shell = document.createElement('div');
      shell.className = 'code-shell';
      block.replaceWith(shell);
      shell.append(block);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy';
      button.textContent = 'Copy';
      button.addEventListener('click', async () => {
        const text = (block.querySelector('code') ?? block).innerText;
        let copied = false;
        try {
          await navigator.clipboard.writeText(text);
          copied = true;
        } catch {
          // Older browsers, and any page the clipboard API refuses: copy through a selection.
          const field = document.createElement('textarea');
          field.value = text;
          field.setAttribute('readonly', '');
          field.style.position = 'fixed';
          field.style.top = '-1000px';
          document.body.append(field);
          field.select();
          copied = document.execCommand('copy');
          field.remove();
        }
        button.textContent = copied ? 'Copied' : 'Select it';
        setTimeout(() => { button.textContent = 'Copy'; }, 1600);
      });
      shell.append(button);
    }
  });
})();
