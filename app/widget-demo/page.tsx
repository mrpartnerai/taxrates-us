'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';

/* ─── Embed code snippets shown in the demo ─────────────────────── */
const BASIC_EMBED = `<!-- Add to your HTML -->
<div id="tax-calculator"
     data-taxrates-widget
     data-theme="light">
</div>
<script src="https://taxrates-us.vercel.app/widget/taxrates-widget.js"></script>`;

const PROGRAMMATIC_EMBED = `<!-- Minimal HTML -->
<div id="tax-calculator"></div>
<script src="https://taxrates-us.vercel.app/widget/taxrates-widget.js"></script>

<!-- Initialize with options -->
<script>
  TaxRatesWidget.init({
    container: '#tax-calculator',
    apiKey: 'wgt_your_key_here',
    amount: 99.99,
    theme: 'light',      // 'light' or 'dark'
    showBreakdown: true,
    onCalculate: function(result) {
      console.log('Tax:', result.tax_amount.toFixed(2));
      console.log('Total:', result.total.toFixed(2));
    }
  });
</script>`;

const SHOPIFY_EMBED = `<!-- In your cart or checkout template -->
<div id="tax-calculator"
     data-taxrates-widget
     data-api-key="{{ settings.taxrates_api_key }}"
     data-amount="{{ cart.total_price | money_without_currency }}"
     data-theme="{{ settings.taxrates_theme }}">
</div>
<script src="https://taxrates-us.vercel.app/widget/taxrates-widget.js"></script>
<script>
  var widget = TaxRatesWidget.getInstance('#tax-calculator');
  // Sync to cart updates
  document.addEventListener('cart:updated', function(e) {
    widget.setAmount(e.detail.total / 100);
    widget.calculate();
  });
</script>`;

/* ─── Copy button ────────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-xs px-2.5 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors select-none"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

/* ─── Code block ─────────────────────────────────────────────────── */
function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-700">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-xs font-medium text-gray-400">{label}</span>
          <CopyButton text={code} />
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm text-gray-300 bg-gray-900 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ─── Widget mount component ─────────────────────────────────────── */
function LiveWidget({ theme }: { theme: 'light' | 'dark' }) {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Wait for TaxRatesWidget to be available
    const tryInit = () => {
      const g = window as any;
      if (!g.TaxRatesWidget || !ref.current || initialized.current) return;
      initialized.current = true;
      g.TaxRatesWidget.init({
        container: ref.current,
        theme,
        showBreakdown: true,
      });
    };

    // Script may already be loaded
    tryInit();

    // Otherwise wait a tick
    const timer = setInterval(() => {
      if ((window as any).TaxRatesWidget) {
        tryInit();
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [theme]);

  return (
    <div ref={ref} className="w-full max-w-xs" />
  );
}

/* ─── Tab state ──────────────────────────────────────────────────── */
type Tab = 'basic' | 'programmatic' | 'shopify';

/* ─── Page ───────────────────────────────────────────────────────── */
export default function WidgetDemoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('basic');

  const codeMap: Record<Tab, string> = {
    basic: BASIC_EMBED,
    programmatic: PROGRAMMATIC_EMBED,
    shopify: SHOPIFY_EMBED,
  };

  const labelMap: Record<Tab, string> = {
    basic: 'HTML (auto-initialize)',
    programmatic: 'HTML + JavaScript',
    shopify: 'Shopify Liquid',
  };

  return (
    <>
      {/* Load the widget script once */}
      <Script src="/widget/taxrates-widget.js" strategy="afterInteractive" />

      <main className="min-h-screen bg-gray-950 text-gray-100">
        {/* Nav */}
        <header className="border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-5 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold tracking-tight">
              taxrates<span className="text-blue-400">-us</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/docs"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Docs
              </Link>
              <Link
                href="https://taxrates-us.vercel.app"
                target="_blank"
                className="text-sm px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium transition-colors"
              >
                Get API Key →
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero */}
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700 mb-4">
              New — Embeddable Widget
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Add a tax calculator{' '}
              <span className="text-blue-400">to any website</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              One{' '}
              <code className="text-blue-300 bg-gray-800 px-1.5 py-0.5 rounded text-base">
                &lt;script&gt;
              </code>{' '}
              tag. Real sales tax rates for all 50 states. Shadow DOM so it never
              breaks your CSS. Works with Shopify, WooCommerce, React, or plain HTML.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {[
              '🏷️ All 50 states',
              '🎨 Light & dark themes',
              '⚡ Live API data',
              '🛡️ Shadow DOM isolated',
              '< 15KB',
              '🔌 Zero dependencies',
            ].map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full text-sm bg-gray-800 text-gray-300 border border-gray-700"
              >
                {f}
              </span>
            ))}
          </div>

          {/* Live demo + code side-by-side */}
          <div className="grid lg:grid-cols-2 gap-10 mb-16 items-start">
            {/* Left: live widgets */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Live demo</h2>
              <div className="flex flex-col gap-8">
                <div>
                  <p className="text-sm text-gray-400 mb-3 font-medium uppercase tracking-widest">Light theme</p>
                  <LiveWidget theme="light" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-3 font-medium uppercase tracking-widest">Dark theme</p>
                  <LiveWidget theme="dark" />
                </div>
              </div>
            </div>

            {/* Right: embed code */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Embed code</h2>

              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-lg bg-gray-800/60 border border-gray-700 mb-4 w-fit">
                {(['basic', 'programmatic', 'shopify'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab === 'programmatic' ? 'JS Init' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <CodeBlock code={codeMap[activeTab]} label={labelMap[activeTab]} />

              <p className="mt-3 text-xs text-gray-500">
                Replace{' '}
                <code className="text-gray-400">wgt_your_key_here</code> with
                your widget API key.{' '}
                <Link href="#pricing" className="text-blue-400 hover:underline">
                  Get a key →
                </Link>
              </p>
            </div>
          </div>

          {/* How it works */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">How it works</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  title: 'Add the script tag',
                  desc: 'Drop a single <script> tag into your page — no build step, no npm install.',
                },
                {
                  step: '2',
                  title: 'Customer selects state & amount',
                  desc: 'The widget fetches the live rate from our API and shows the tax amount instantly.',
                },
                {
                  step: '3',
                  title: 'Increase checkout confidence',
                  desc: 'Customers see their total before they pay — fewer surprises, fewer abandoned carts.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-6 rounded-xl border border-gray-700 bg-gray-800/40"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="mb-16">
            <h2 className="text-2xl font-bold mb-2 text-center">Pricing</h2>
            <p className="text-gray-400 text-center mb-8">Simple, predictable pricing. Cancel anytime.</p>
            <div className="max-w-sm mx-auto">
              <div className="rounded-2xl border border-blue-500 bg-gray-800/60 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-2xl" />
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900/70 text-blue-300 border border-blue-700 mb-4">
                  Widget Plan
                </span>
                <div className="text-5xl font-bold mb-1">
                  $19<span className="text-xl text-gray-400 font-normal">/mo</span>
                </div>
                <p className="text-gray-400 text-sm mb-6">Per domain · Unlimited calculations</p>
                <ul className="text-sm text-gray-300 space-y-2 mb-8 text-left">
                  {[
                    'All 50 states + DC',
                    '10,000 API requests / day',
                    'Light & dark themes',
                    'Rate breakdown display',
                    'onCalculate / onError callbacks',
                    '14-day free trial',
                    'Email support',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-blue-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="https://taxrates-us.vercel.app"
                  target="_blank"
                  className="block w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                >
                  Start free trial →
                </Link>
                <p className="text-xs text-gray-500 mt-3">No credit card required</p>
              </div>
            </div>
          </section>

          {/* API reference quick ref */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Widget API reference</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-400 font-semibold">Option</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-semibold">Type</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-semibold">Default</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {[
                    ['container', 'string | Element', '—', 'CSS selector or DOM element to mount into'],
                    ['apiKey', 'string', '—', 'Your widget API key (wgt_…)'],
                    ['theme', "'light' | 'dark'", "'light'", 'Visual theme'],
                    ['amount', 'number', 'undefined', 'Pre-fill subtotal'],
                    ['state', 'string', 'undefined', 'Pre-select state (2-letter code)'],
                    ['showBreakdown', 'boolean', 'true', 'Show state/county/city rate breakdown'],
                    ['onCalculate', 'function(result)', 'undefined', 'Callback after successful calculation'],
                    ['onError', 'function(error)', 'undefined', 'Callback on error'],
                  ].map(([opt, type, def, desc]) => (
                    <tr key={opt} className="bg-gray-900 hover:bg-gray-800/60 transition-colors">
                      <td className="px-5 py-3 font-mono text-blue-300">{opt}</td>
                      <td className="px-5 py-3 font-mono text-gray-400 text-xs">{type}</td>
                      <td className="px-5 py-3 font-mono text-gray-500 text-xs">{def}</td>
                      <td className="px-5 py-3 text-gray-300">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-gray-300">Instance methods</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left px-5 py-3 text-gray-400 font-semibold">Method</th>
                      <th className="text-left px-5 py-3 text-gray-400 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {[
                      ['widget.calculate()', 'Trigger a tax calculation with current inputs'],
                      ['widget.setAmount(n)', 'Update the subtotal input programmatically'],
                      ['widget.destroy()', 'Remove the widget from the DOM'],
                      ['TaxRatesWidget.getInstance(sel)', 'Get an existing instance by selector'],
                    ].map(([method, desc]) => (
                      <tr key={method} className="bg-gray-900 hover:bg-gray-800/60 transition-colors">
                        <td className="px-5 py-3 font-mono text-blue-300 text-xs">{method}</td>
                        <td className="px-5 py-3 text-gray-300">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Data attributes quick ref */}
          <section className="mb-16">
            <h2 className="text-xl font-bold mb-4">Auto-init via data attributes</h2>
            <p className="text-gray-400 text-sm mb-4">
              Add <code className="text-blue-300 bg-gray-800 px-1 py-0.5 rounded">data-taxrates-widget</code> to any{' '}
              <code className="text-blue-300 bg-gray-800 px-1 py-0.5 rounded">&lt;div&gt;</code> and the
              widget initializes automatically when the script loads.
            </p>
            <CodeBlock
              label="Auto-init example"
              code={`<div data-taxrates-widget
     data-api-key="wgt_xxxxxxxxxxxx"
     data-theme="dark"
     data-amount="149.99"
     data-state="CA">
</div>
<script src="https://taxrates-us.vercel.app/widget/taxrates-widget.js"></script>`}
            />
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8 mt-4">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <span>© {new Date().getFullYear()} TaxRates-US · All rights reserved</span>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
              <Link href="/docs" className="hover:text-gray-300 transition-colors">Docs</Link>
              <Link href="https://github.com/mrpartnerai/taxrates-us" target="_blank" className="hover:text-gray-300 transition-colors">GitHub</Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
