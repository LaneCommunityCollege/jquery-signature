/* Native signature generator. No framework or build step required. */
(function (window, document) {
  'use strict';

  if (window.LaneSignatureGenerator) {
    window.LaneSignatureGenerator.registerDrupal();
    window.LaneSignatureGenerator.init(document);
    return;
  }

  const selector = '[data-lane-signature-generator]';
  const initialized = new WeakSet();
  let instance = 0;

  function httpURL(value) {
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch (_) { return null; }
  }

  function initialize(root) {
    if (initialized.has(root)) return;
    const form = root.querySelector('[data-signature-form]');
    const preview = root.querySelector('[data-signature-preview]');
    const copyButton = root.querySelector('[data-copy-signature]');
    const status = root.querySelector('[data-copy-status]');
    const socialTemplate = root.querySelector('template[data-social-templates]');
    const additionTemplate = root.querySelector('template[data-addition-templates]');
    if (!form || !preview || !copyButton || !status || !socialTemplate || !additionTemplate) return;
    initialized.add(root);

    // Give each instance its own label, help, and error IDs, including cloned blocks.
    const prefix = 'lane-signature-' + (++instance) + '-';
    const ids = new Map();
    root.querySelectorAll('[id]').forEach(element => {
      const previous = element.id;
      const next = prefix + previous.replace(/^lane-signature-\d+-|^lsg-/, '');
      ids.set(previous, next);
      element.id = next;
    });
    root.querySelectorAll('[for], [aria-describedby], [aria-labelledby], [aria-controls]').forEach(element => {
      ['for', 'aria-describedby', 'aria-labelledby', 'aria-controls'].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        element.setAttribute(attribute, element.getAttribute(attribute).split(/\s+/).map(id => ids.get(id) || id).join(' '));
      });
    });

    const fields = new Map(Array.from(form.querySelectorAll('[data-field]'), field => [field.dataset.field, field]));
    const socialToggles = Array.from(form.querySelectorAll('[data-social-toggle]'));
    const additionToggles = Array.from(form.querySelectorAll('[data-addition-toggle]'));
    const touched = new Set();
    const errors = new Map();
    let statusTimer;
    const value = key => fields.get(key).value.trim();
    const selectedSocial = () => socialToggles.filter(toggle => toggle.checked);
    const selectedAdditions = () => additionToggles.filter(toggle => toggle.checked);

    fields.forEach(field => {
      const error = root.querySelector('[id="' + field.id + '-error"]') || document.createElement('p');
      error.className = 'lsg-error-message';
      error.id = field.id + '-error';
      error.hidden = true;
      const group = field.closest('.lsg-input-group');
      (group ? group.parentElement : field.parentElement).append(error);
      const describedBy = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      field.setAttribute('aria-describedby', [...new Set([...describedBy, error.id])].join(' '));
      errors.set(field, error);
    });

    function messageFor(field) {
      const key = field.dataset.field;
      const text = field.value.trim();
      if (field.disabled) return '';
      if (key === 'name' && !text) return 'Please enter your name.';
      if (field.required && !text) return 'Please enter a URL for this social link.';
      if (!text) return '';
      if (key === 'email') {
        if (field.validity.typeMismatch || !/^[^\s@]+@lanecc\.edu$/i.test(text)) {
          return 'Please enter your Lane email address, ending in @lanecc.edu.';
        }
      }
      if (field.type === 'url' && !httpURL(text)) return 'Please enter a full web address starting with https:// or http://.';
      if (field.type === 'tel') {
        const digits = text.replace(/\D/g, '');
        const local = digits.length === 11 && digits[0] === '1' ? digits.slice(1) : digits;
        if (!/^[+\d\s().-]+$/.test(text) || !/^[2-9]\d{2}[2-9]\d{6}$/.test(local)) {
          return 'Please enter a 10-digit phone number, including the area code.';
        }
      }
      return '';
    }

    function validate(field, reveal) {
      field.setCustomValidity('');
      const message = messageFor(field);
      field.setCustomValidity(message);
      const error = errors.get(field);
      const show = Boolean(message && reveal && !field.disabled);
      error.textContent = show ? message : '';
      error.hidden = !show;
      if (show) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
      return !message;
    }

    function clearStatus() {
      window.clearTimeout(statusTimer);
      status.hidden = true;
      status.textContent = '';
    }

    function notify(message, tone) {
      clearStatus();
      status.dataset.tone = tone;
      status.textContent = message;
      status.hidden = false;
      if (tone === 'success') statusTimer = window.setTimeout(clearStatus, 5000);
    }

    function synchronizeSocial() {
      socialToggles.forEach(toggle => {
        const field = fields.get(toggle.dataset.socialToggle);
        field.hidden = !toggle.checked;
        field.disabled = !toggle.checked;
        field.required = toggle.checked;
        toggle.setAttribute('aria-expanded', String(toggle.checked));
      });
    }

    function render() {
      synchronizeSocial();
      const name = preview.querySelector('[data-signature-field="name"]');
      const text = value('name');
      name.replaceChildren();
      if (!text) name.textContent = 'Your Name';
      else {
        const comma = text.indexOf(',');
        name.append(document.createTextNode(comma < 0 ? text : text.slice(0, comma)));
        if (comma >= 0) {
          const credentials = document.createElement('span');
          credentials.setAttribute('style', 'font-weight:normal;font-size:0.9em;');
          credentials.textContent = text.slice(comma);
          name.append(credentials);
        }
      }
      ['title', 'department', 'campus', 'email', 'pronouns'].forEach(key => {
        const target = preview.querySelector('[data-signature-field="' + key + '"]');
        const line = preview.querySelector('[data-signature-line="' + key + '"]');
        target.textContent = value(key);
        line.style.display = value(key) ? 'inline' : 'none';
        if (key === 'department' && value(key) && httpURL(value('url'))) {
          const link = document.createElement('a');
          link.href = httpURL(value('url'));
          link.setAttribute('style', 'color:#337ab7;text-decoration:none;display:inline;');
          link.textContent = value(key);
          target.replaceChildren(link);
        }
      });
      const phones = preview.querySelector('[data-signature-phones]');
      phones.replaceChildren();
      ['phone', 'mobile', 'fax'].filter(key => value(key)).forEach((key, index) => {
        if (index) phones.append(document.createTextNode('\u00a0 '));
        const label = document.createElement('span');
        label.setAttribute('style', 'font-weight:bold;');
        label.textContent = ({ phone: 'O: ', mobile: 'M: ', fax: 'F: ' })[key];
        phones.append(label, document.createTextNode(value(key)));
      });
      const row = preview.querySelector('[data-signature-social] tr');
      row.replaceChildren();
      selectedSocial().map(toggle => {
        const key = toggle.dataset.socialToggle;
        const icon = socialTemplate.content.querySelector('[data-social-icon="' + key + '"]').cloneNode(true);
        const link = icon.querySelector('a');
        const href = httpURL(value(key));
        if (href) link.setAttribute('href', href);
        else link.removeAttribute('href');
        return icon;
      }).sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index)).forEach(icon => row.append(icon));
      const additions = selectedAdditions().map(toggle => additionTemplate.content.querySelector('[data-addition="' + toggle.dataset.additionToggle + '"]').cloneNode(true));
      additions.sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
      preview.querySelector('[data-signature-additions]').replaceChildren(...additions);
    }

    function plainText() {
      const lines = [value('name')];
      ['title', 'department'].forEach(key => { if (value(key)) lines.push(value(key)); });
      if (value('department') && httpURL(value('url'))) lines.push(httpURL(value('url')));
      lines.push('Lane Community College');
      ['campus', 'email'].forEach(key => { if (value(key)) lines.push(value(key)); });
      if (value('pronouns')) lines.push('Pronouns: ' + value('pronouns'));
      ['phone', 'mobile', 'fax'].forEach(key => { if (value(key)) lines.push(({ phone: 'Office: ', mobile: 'Mobile: ', fax: 'Fax: ' })[key] + value(key)); });
      selectedSocial().forEach(toggle => {
        const field = fields.get(toggle.dataset.socialToggle);
        const label = field.getAttribute('aria-label').replace(/ URL$/, '');
        lines.push(label + ': ' + value(toggle.dataset.socialToggle));
      });
      preview.querySelectorAll('[data-signature-additions] > *').forEach(addition => {
        const clone = addition.cloneNode(true);
        clone.querySelectorAll('a').forEach(link => {
          if (link.textContent.trim() !== link.getAttribute('href')) link.append(document.createTextNode(' (' + link.getAttribute('href') + ')'));
        });
        lines.push(clone.textContent.replace(/\s+/g, ' ').trim());
      });
      return lines.join('\n');
    }

    function exportHTML() {
      const clone = preview.firstElementChild.cloneNode(true);
      [clone, ...clone.querySelectorAll('*')].forEach(element => {
        if (element.hidden || element.style.display === 'none') { element.remove(); return; }
        Array.from(element.attributes).forEach(attribute => {
          if (['id', 'class'].includes(attribute.name) || attribute.name.startsWith('data-')) element.removeAttribute(attribute.name);
        });
      });
      clone.querySelectorAll('a').forEach(link => {
        if (!link.style.color) link.style.color = '#337ab7';
        if (!link.style.textDecoration) link.style.textDecoration = 'underline';
      });
      return clone.outerHTML;
    }

    function selectPreview() {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(preview);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function legacyCopy(html, plain) {
      selectPreview();
      const onCopy = event => {
        if (!event.clipboardData) return;
        event.clipboardData.setData('text/html', html);
        event.clipboardData.setData('text/plain', plain);
        event.preventDefault();
      };
      document.addEventListener('copy', onCopy);
      try { return Boolean(document.execCommand && document.execCommand('copy')); }
      catch (_) { return false; }
      finally { document.removeEventListener('copy', onCopy); }
    }

    async function copy() {
      render();
      let firstInvalid;
      fields.forEach(field => {
        touched.add(field);
        if (!validate(field, true) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        notify('Please correct the highlighted fields before copying your signature.', 'error');
        firstInvalid.focus();
        return;
      }
      const html = exportHTML();
      const plain = plainText();
      copyButton.disabled = true;
      let copied = false;
      try {
        if (window.isSecureContext && window.navigator.clipboard && window.ClipboardItem) {
          const item = new window.ClipboardItem({
            'text/html': new window.Blob([html], { type: 'text/html' }),
            'text/plain': new window.Blob([plain], { type: 'text/plain' })
          });
          await window.navigator.clipboard.write([item]);
          copied = true;
        }
      } catch (_) { /* A denied clipboard write can still use selection copying. */ }
      try {
        if (!copied) copied = legacyCopy(html, plain);
        if (copied) notify('Signature copied. Paste it into Gmail’s signature settings.', 'success');
        else {
          selectPreview();
          notify('Automatic copying was unavailable. Your signature is selected; press Ctrl+C or Command+C, then paste it into Gmail.', 'error');
        }
      } finally { copyButton.disabled = false; }
    }

    function update(event) {
      if (!event.target.matches('[data-field], [data-social-toggle], [data-addition-toggle]')) return;
      clearStatus();
      render();
      fields.forEach(field => validate(field, touched.has(field)));
    }
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('blur', event => {
      if (!event.target.matches('[data-field]')) return;
      touched.add(event.target);
      validate(event.target, true);
    }, true);
    form.addEventListener('submit', event => { event.preventDefault(); copy(); });
    form.addEventListener('reset', () => window.setTimeout(() => {
      touched.clear();
      clearStatus();
      render();
      fields.forEach(field => validate(field, false));
    }, 0));
    copyButton.addEventListener('click', copy);
    render();
    fields.forEach(field => validate(field, false));
  }

  function init(context = document) {
    if (context.closest) {
      const root = context.closest(selector);
      if (root) initialize(root);
    }
    if (context.querySelectorAll) context.querySelectorAll(selector).forEach(initialize);
  }

  function registerDrupal() {
    if (window.Drupal && window.Drupal.behaviors) {
      window.Drupal.behaviors.laneSignatureGenerator = { attach: init };
    }
  }

  window.LaneSignatureGenerator = Object.freeze({ init, registerDrupal });
  registerDrupal();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(document), { once: true });
  else init(document);
})(window, document);
