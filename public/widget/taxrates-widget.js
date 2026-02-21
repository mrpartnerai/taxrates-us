/**
 * TaxRates-US Embeddable Widget v1.0
 * https://taxrates-us.vercel.app
 *
 * Usage:
 *   <div id="tax-calculator" data-api-key="wgt_xxx" data-theme="light"></div>
 *   <script src="/widget/taxrates-widget.js"></script>
 *   <script>TaxRatesWidget.init({ container: '#tax-calculator', apiKey: 'wgt_xxx' });</script>
 *
 * Or fully self-initializing via data attributes on a div.taxrates-widget element.
 */
(function (global) {
  'use strict';

  var US_STATES = [
    ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
    ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
    ['DC', 'D.C.'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'],
    ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'],
    ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'],
    ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
    ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'],
    ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'],
    ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'],
    ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'],
    ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'],
    ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'],
    ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming']
  ];

  /* ─── Styles ─────────────────────────────────────────────────── */
  function buildStyles(theme) {
    var isDark = theme === 'dark';
    return [
      ':host { display: block; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }',
      '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',

      '.widget {',
      '  background: ' + (isDark ? '#1e2028' : '#ffffff') + ';',
      '  color: ' + (isDark ? '#e8eaf0' : '#1a1d23') + ';',
      '  border: 1px solid ' + (isDark ? '#2e3140' : '#e2e5ec') + ';',
      '  border-radius: 12px;',
      '  padding: 20px;',
      '  max-width: 340px;',
      '  box-shadow: 0 2px 8px rgba(0,0,0,' + (isDark ? '0.32' : '0.06') + ');',
      '}',

      '.header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }',
      '.header-icon { width: 20px; height: 20px; flex-shrink: 0; }',
      '.title { font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }',

      '.field { margin-bottom: 12px; }',
      'label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: ' + (isDark ? '#8890a8' : '#6b7280') + '; margin-bottom: 5px; }',

      'select, input {',
      '  width: 100%;',
      '  padding: 9px 12px;',
      '  font-size: 14px;',
      '  font-family: inherit;',
      '  background: ' + (isDark ? '#13151c' : '#f8f9fb') + ';',
      '  color: ' + (isDark ? '#e8eaf0' : '#1a1d23') + ';',
      '  border: 1px solid ' + (isDark ? '#2e3140' : '#dde1ea') + ';',
      '  border-radius: 7px;',
      '  outline: none;',
      '  transition: border-color 0.15s;',
      '  appearance: none;',
      '}',
      'select:focus, input:focus { border-color: #4f74e3; box-shadow: 0 0 0 3px rgba(79,116,227,0.15); }',

      '.select-wrap { position: relative; }',
      '.select-wrap::after {',
      '  content: "";',
      '  pointer-events: none;',
      '  position: absolute;',
      '  right: 12px;',
      '  top: 50%;',
      '  transform: translateY(-50%);',
      '  width: 0; height: 0;',
      '  border-left: 4px solid transparent;',
      '  border-right: 4px solid transparent;',
      '  border-top: 5px solid ' + (isDark ? '#8890a8' : '#6b7280') + ';',
      '}',
      'select { padding-right: 32px; cursor: pointer; }',

      '.input-prefix { position: relative; }',
      '.prefix-symbol {',
      '  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);',
      '  font-size: 14px; color: ' + (isDark ? '#8890a8' : '#6b7280') + '; pointer-events: none;',
      '}',
      '.input-prefix input { padding-left: 24px; }',

      'button {',
      '  width: 100%;',
      '  padding: 10px;',
      '  font-size: 14px;',
      '  font-weight: 600;',
      '  font-family: inherit;',
      '  background: #4f74e3;',
      '  color: #fff;',
      '  border: none;',
      '  border-radius: 7px;',
      '  cursor: pointer;',
      '  transition: background 0.15s, opacity 0.15s;',
      '  margin-top: 4px;',
      '}',
      'button:hover:not(:disabled) { background: #3d5fd4; }',
      'button:disabled { opacity: 0.55; cursor: not-allowed; }',

      '.result {',
      '  margin-top: 14px;',
      '  padding: 14px;',
      '  background: ' + (isDark ? '#13151c' : '#f4f6fb') + ';',
      '  border: 1px solid ' + (isDark ? '#2e3140' : '#e2e5ec') + ';',
      '  border-radius: 8px;',
      '  display: none;',
      '}',
      '.result.visible { display: block; }',

      '.result-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 3px 0; }',
      '.result-label { color: ' + (isDark ? '#8890a8' : '#6b7280') + '; }',
      '.result-value { font-weight: 500; }',

      '.result-divider { border: none; border-top: 1px solid ' + (isDark ? '#2e3140' : '#e2e5ec') + '; margin: 8px 0; }',

      '.result-total { font-size: 15px; font-weight: 700; }',
      '.result-total .result-value { color: #4f74e3; }',

      '.jurisdiction { font-size: 11px; color: ' + (isDark ? '#8890a8' : '#9ca3af') + '; margin-top: 10px; text-align: center; }',

      '.breakdown { margin-top: 8px; }',
      '.breakdown-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: ' + (isDark ? '#8890a8' : '#9ca3af') + '; margin-bottom: 5px; }',
      '.breakdown-row { display: flex; justify-content: space-between; font-size: 11px; color: ' + (isDark ? '#8890a8' : '#9ca3af') + '; padding: 2px 0; }',

      '.error { margin-top: 10px; padding: 9px 12px; background: ' + (isDark ? '#2d1a1a' : '#fff1f0') + '; color: ' + (isDark ? '#f87171' : '#dc2626') + '; border: 1px solid ' + (isDark ? '#4b1c1c' : '#fecaca') + '; border-radius: 7px; font-size: 12px; display: none; }',
      '.error.visible { display: block; }',

      '.loading { display: none; }',
      '.loading.visible { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 6px; vertical-align: middle; }',
      '@keyframes spin { to { transform: rotate(360deg); } }',

      '.footer { margin-top: 12px; text-align: center; font-size: 10px; color: ' + (isDark ? '#4a4f6a' : '#c5c9d6') + '; }',
      '.footer a { color: inherit; text-decoration: none; }',
      '.footer a:hover { color: ' + (isDark ? '#8890a8' : '#9ca3af') + '; }'
    ].join('\n');
  }

  /* ─── HTML Template ───────────────────────────────────────────── */
  function buildHTML() {
    var stateOptions = '<option value="">Select state…</option>';
    for (var i = 0; i < US_STATES.length; i++) {
      stateOptions += '<option value="' + US_STATES[i][0] + '">' + US_STATES[i][0] + ' – ' + US_STATES[i][1] + '</option>';
    }

    return [
      '<div class="widget">',
      '  <div class="header">',
      '    <svg class="header-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '      <rect x="2" y="3" width="16" height="14" rx="2" stroke="#4f74e3" stroke-width="1.5"/>',
      '      <path d="M6 8h8M6 11h5" stroke="#4f74e3" stroke-width="1.5" stroke-linecap="round"/>',
      '      <path d="M13 11.5l1.5 1.5L16 11" stroke="#4f74e3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
      '    </svg>',
      '    <span class="title">Tax Calculator</span>',
      '  </div>',

      '  <div class="field">',
      '    <label for="tr-state">State</label>',
      '    <div class="select-wrap">',
      '      <select id="tr-state">' + stateOptions + '</select>',
      '    </div>',
      '  </div>',

      '  <div class="field">',
      '    <label for="tr-amount">Subtotal</label>',
      '    <div class="input-prefix">',
      '      <span class="prefix-symbol">$</span>',
      '      <input id="tr-amount" type="number" min="0" step="0.01" placeholder="0.00">',
      '    </div>',
      '  </div>',

      '  <button id="tr-btn" type="button">',
      '    <span class="loading" id="tr-spinner"></span>',
      '    <span id="tr-btn-text">Calculate Tax</span>',
      '  </button>',

      '  <div class="error" id="tr-error"></div>',

      '  <div class="result" id="tr-result">',
      '    <div class="result-row">',
      '      <span class="result-label">Subtotal</span>',
      '      <span class="result-value" id="tr-subtotal-display">—</span>',
      '    </div>',
      '    <div class="result-row">',
      '      <span class="result-label">Tax rate</span>',
      '      <span class="result-value" id="tr-rate-display">—</span>',
      '    </div>',
      '    <div class="result-row">',
      '      <span class="result-label">Tax amount</span>',
      '      <span class="result-value" id="tr-tax-display">—</span>',
      '    </div>',
      '    <hr class="result-divider">',
      '    <div class="result-row result-total">',
      '      <span class="result-label">Total</span>',
      '      <span class="result-value" id="tr-total-display">—</span>',
      '    </div>',
      '    <div class="breakdown" id="tr-breakdown" style="display:none">',
      '      <div class="result-divider" style="margin-top:10px"></div>',
      '      <div class="breakdown-title">Rate breakdown</div>',
      '      <div class="breakdown-row"><span>State</span><span id="tr-comp-state">—</span></div>',
      '      <div class="breakdown-row"><span>County</span><span id="tr-comp-county">—</span></div>',
      '      <div class="breakdown-row"><span>City</span><span id="tr-comp-city">—</span></div>',
      '      <div class="breakdown-row"><span>District</span><span id="tr-comp-district">—</span></div>',
      '    </div>',
      '    <div class="jurisdiction" id="tr-jurisdiction"></div>',
      '  </div>',

      '  <div class="footer"><a href="https://taxrates-us.vercel.app" target="_blank" rel="noopener">Powered by TaxRates-US</a></div>',
      '</div>'
    ].join('\n');
  }

  /* ─── Widget Instance ─────────────────────────────────────────── */
  function fmt(n) { return '$' + n.toFixed(2); }
  function pct(n) { return (n * 100).toFixed(4).replace(/\.?0+$/, '') + '%'; }

  function WidgetInstance(container, options) {
    this.container = container;
    this.options = options || {};
    this._apiBase = this.options.apiBase || '';
    this._apiKey = this.options.apiKey || container.dataset.apiKey || '';
    this._theme = this.options.theme || container.dataset.theme || 'light';
    this._showBreakdown = this.options.showBreakdown !== false;
    this._loading = false;
    this._init();
  }

  WidgetInstance.prototype._init = function () {
    var shadow = this.container.attachShadow({ mode: 'open' });

    var style = document.createElement('style');
    style.textContent = buildStyles(this._theme);
    shadow.appendChild(style);

    var wrapper = document.createElement('div');
    wrapper.innerHTML = buildHTML();
    shadow.appendChild(wrapper);

    this._shadow = shadow;
    this._btn = shadow.getElementById('tr-btn');
    this._spinner = shadow.getElementById('tr-spinner');
    this._btnText = shadow.getElementById('tr-btn-text');
    this._stateEl = shadow.getElementById('tr-state');
    this._amountEl = shadow.getElementById('tr-amount');
    this._resultEl = shadow.getElementById('tr-result');
    this._errorEl = shadow.getElementById('tr-error');
    this._breakdownEl = shadow.getElementById('tr-breakdown');

    // Pre-fill amount if provided
    if (this.options.amount != null) {
      this._amountEl.value = parseFloat(this.options.amount).toFixed(2);
    }
    // Pre-fill state if provided
    if (this.options.state) {
      this._stateEl.value = this.options.state.toUpperCase();
    }

    var self = this;
    this._btn.addEventListener('click', function () { self.calculate(); });

    // Auto-calculate on Enter
    this._amountEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') self.calculate();
    });
  };

  WidgetInstance.prototype.calculate = function (overrides) {
    if (this._loading) return;

    var state = (overrides && overrides.state) || this._stateEl.value;
    var amount = parseFloat((overrides && overrides.amount) != null ? overrides.amount : this._amountEl.value);

    if (!state) { this._showError('Please select a state.'); return; }
    if (isNaN(amount) || amount < 0) { this._showError('Please enter a valid subtotal.'); return; }

    this._setLoading(true);
    this._hideError();

    var url = this._apiBase + '/api/rate?state=' + encodeURIComponent(state);
    if (this._apiKey) url += '&api_key=' + encodeURIComponent(this._apiKey);

    var self = this;
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        self._setLoading(false);
        if (!data.supported) {
          self._showError(data.reason || 'State not supported.');
          return;
        }
        self._showResult(data, amount);
        if (typeof self.options.onCalculate === 'function') {
          self.options.onCalculate({
            state: state,
            subtotal: amount,
            tax_rate: data.rate,
            tax_amount: amount * data.rate,
            total: amount + amount * data.rate,
            jurisdiction: data.jurisdiction,
            percentage: data.percentage,
            components: data.components
          });
        }
      })
      .catch(function (err) {
        self._setLoading(false);
        var msg = 'Unable to fetch tax rate. Please try again.';
        self._showError(msg);
        if (typeof self.options.onError === 'function') {
          self.options.onError(new Error(msg));
        }
      });
  };

  WidgetInstance.prototype._showResult = function (data, amount) {
    var taxAmount = amount * data.rate;
    var total = amount + taxAmount;

    this._shadow.getElementById('tr-subtotal-display').textContent = fmt(amount);
    this._shadow.getElementById('tr-rate-display').textContent = data.percentage;
    this._shadow.getElementById('tr-tax-display').textContent = fmt(taxAmount);
    this._shadow.getElementById('tr-total-display').textContent = fmt(total);
    this._shadow.getElementById('tr-jurisdiction').textContent = data.jurisdiction;

    if (this._showBreakdown && data.components) {
      var c = data.components;
      this._shadow.getElementById('tr-comp-state').textContent = pct(c.state || 0);
      this._shadow.getElementById('tr-comp-county').textContent = pct(c.county || 0);
      this._shadow.getElementById('tr-comp-city').textContent = pct(c.city || 0);
      this._shadow.getElementById('tr-comp-district').textContent = pct(c.district || 0);
      this._breakdownEl.style.display = 'block';
    }

    this._resultEl.classList.add('visible');
  };

  WidgetInstance.prototype._setLoading = function (on) {
    this._loading = on;
    this._btn.disabled = on;
    this._spinner.classList.toggle('visible', on);
    this._btnText.textContent = on ? 'Calculating…' : 'Calculate Tax';
  };

  WidgetInstance.prototype._showError = function (msg) {
    this._errorEl.textContent = msg;
    this._errorEl.classList.add('visible');
  };

  WidgetInstance.prototype._hideError = function () {
    this._errorEl.classList.remove('visible');
    this._errorEl.textContent = '';
  };

  WidgetInstance.prototype.setAmount = function (amount) {
    this._amountEl.value = parseFloat(amount).toFixed(2);
  };

  WidgetInstance.prototype.destroy = function () {
    this.container.innerHTML = '';
  };

  /* ─── Public API ──────────────────────────────────────────────── */
  var instances = [];

  var TaxRatesWidget = {
    /**
     * Initialize a widget.
     * @param {object} opts - { container, apiKey, theme, amount, state, showBreakdown, onCalculate, onError }
     * @returns {WidgetInstance}
     */
    init: function (opts) {
      opts = opts || {};
      var selector = opts.container || '[data-taxrates-widget]';
      var el = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!el) { console.warn('[TaxRatesWidget] Container not found:', selector); return null; }
      var inst = new WidgetInstance(el, opts);
      instances.push(inst);
      return inst;
    },

    getInstance: function (selector) {
      var el = typeof selector === 'string' ? document.querySelector(selector) : selector;
      for (var i = 0; i < instances.length; i++) {
        if (instances[i].container === el) return instances[i];
      }
      return null;
    },

    /** Auto-initialize any [data-taxrates-widget] elements on the page */
    autoInit: function () {
      var els = document.querySelectorAll('[data-taxrates-widget]');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        // Don't double-init
        if (el.shadowRoot) continue;
        TaxRatesWidget.init({
          container: el,
          apiKey: el.dataset.apiKey,
          theme: el.dataset.theme || 'light',
          amount: el.dataset.amount ? parseFloat(el.dataset.amount) : undefined,
          state: el.dataset.state
        });
      }
    }
  };

  /* ─── Auto-init on DOM ready ──────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', TaxRatesWidget.autoInit);
  } else {
    TaxRatesWidget.autoInit();
  }

  /* ─── Export ──────────────────────────────────────────────────── */
  global.TaxRatesWidget = TaxRatesWidget;

}(typeof window !== 'undefined' ? window : this));
