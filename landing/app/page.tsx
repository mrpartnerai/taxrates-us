import Link from 'next/link';
import { Github, Package } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">taxrates-us</h1>
          <div className="flex gap-4">
            <Link 
              href="https://github.com/mrpartnerai/taxrates-us"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </Link>
            <Link 
              href="https://www.npmjs.com/package/taxrates-us"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
            >
              <Package className="w-5 h-5" />
              <span>npm</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-block px-4 py-2 rounded-full bg-blue-600/20 text-blue-400 text-sm font-medium mb-6">
          Open Source • Zero Dependencies • Offline-First
        </div>
        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Accurate US Sales Tax Rates
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Self-hosted TypeScript package and API for sales tax lookups. 7 states supported, 546 California jurisdictions, zero external dependencies.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link 
            href="https://www.npmjs.com/package/taxrates-us"
            className="px-8 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-lg transition"
          >
            Get Started
          </Link>
          <Link 
            href="https://github.com/mrpartnerai/taxrates-us"
            className="px-8 py-4 rounded-lg bg-gray-800 hover:bg-gray-700 font-semibold text-lg transition"
          >
            View on GitHub
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold mb-12 text-center">Features</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-xl font-semibold mb-2">Zero Dependencies</h4>
            <p className="text-gray-400">Pure TypeScript. No external runtime dependencies. Works completely offline.</p>
          </div>
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="text-4xl mb-4">🗺️</div>
            <h4 className="text-xl font-semibold mb-2">7 States Supported</h4>
            <p className="text-gray-400">CA, TX, NY, FL, WA, NV, OR — 546 California jurisdictions with city-level precision.</p>
          </div>
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="text-4xl mb-4">📦</div>
            <h4 className="text-xl font-semibold mb-2">Bundled Data</h4>
            <p className="text-gray-400">All tax rate data bundled with the package. No API keys, no external calls.</p>
          </div>
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="text-4xl mb-4">🔍</div>
            <h4 className="text-xl font-semibold mb-2">Auto-Detect State</h4>
            <p className="text-gray-400">Automatically detect state from ZIP code prefix for seamless lookups.</p>
          </div>
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="text-4xl mb-4">✅</div>
            <h4 className="text-xl font-semibold mb-2">Type-Safe</h4>
            <p className="text-gray-400">Full TypeScript support with IntelliSense and type definitions.</p>
          </div>
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="text-4xl mb-4">📚</div>
            <h4 className="text-xl font-semibold mb-2">Official Sources</h4>
            <p className="text-gray-400">All rates from state tax authorities (CDTFA, Comptroller, etc.).</p>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold mb-12 text-center">Quick Start</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {/* NPM Package */}
          <div>
            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-red-500" />
              NPM Package
            </h4>
            <pre className="bg-gray-900 p-6 rounded-lg overflow-x-auto border border-gray-700">
              <code className="text-sm text-gray-300">{`import { getTaxRate } from 'taxrates-us';

// Auto-detect state from ZIP
const rate = getTaxRate({ 
  zip: '90210' 
});
console.log(rate.percentage); 
// "9.50%" (Beverly Hills, CA)

// California city lookup
const sf = getTaxRate({ 
  state: 'CA', 
  city: 'San Francisco' 
});
console.log(sf.percentage); 
// "8.625%"

// State lookup
const tx = getTaxRate({ 
  state: 'TX' 
});
console.log(tx.percentage); 
// "6.25%"`}</code>
            </pre>
          </div>

          {/* API */}
          <div>
            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-green-500">🌐</span>
              Hosted API
            </h4>
            <pre className="bg-gray-900 p-6 rounded-lg overflow-x-auto border border-gray-700">
              <code className="text-sm text-gray-300">{`# Get rate by ZIP code
curl "https://taxrates-us.vercel.app\\
/api/rate?zip=90210"

# Get rate by state
curl "https://taxrates-us.vercel.app\\
/api/rate?state=TX"

# California city lookup
curl "https://taxrates-us.vercel.app\\
/api/rate?state=CA&city=Sacramento"

# List supported states
curl "https://taxrates-us.vercel.app\\
/api/states"`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold mb-12 text-center">Pricing</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {/* NPM Package */}
          <div className="p-8 rounded-lg bg-gray-800/50 border-2 border-gray-700">
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold mb-2">NPM Package</h4>
              <div className="text-4xl font-bold text-green-400 mb-2">Free</div>
              <p className="text-gray-400">Open source forever</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Unlimited requests</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>All 7 states included</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Works offline</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Self-hosted control</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>TypeScript types</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>MIT license</span>
              </li>
            </ul>
            <Link 
              href="https://www.npmjs.com/package/taxrates-us"
              className="block text-center px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 font-semibold transition"
            >
              Install Now
            </Link>
          </div>

          {/* Hosted API - Free */}
          <div className="p-8 rounded-lg bg-gray-800/50 border-2 border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-full text-sm font-semibold">
              Popular
            </div>
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold mb-2">Hosted API</h4>
              <div className="text-4xl font-bold text-blue-400 mb-2">Free</div>
              <p className="text-gray-400">For development</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">✓</span>
                <span>10 req/min per IP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">✓</span>
                <span>100 req/hour per IP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">✓</span>
                <span>All 7 states</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">✓</span>
                <span>CORS enabled</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">✓</span>
                <span>Vercel Edge Network</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">✓</span>
                <span>No API key required</span>
              </li>
            </ul>
            <Link 
              href="https://taxrates-us.vercel.app/api"
              className="block text-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition"
            >
              Try API
            </Link>
          </div>

          {/* Self-Hosted API */}
          <div className="p-8 rounded-lg bg-gray-800/50 border-2 border-gray-700">
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold mb-2">Self-Hosted API</h4>
              <div className="text-4xl font-bold text-purple-400 mb-2">Free</div>
              <p className="text-gray-400">Deploy your own</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Unlimited requests</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Your own domain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Custom rate limits</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Full control</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>Deploy to Vercel/AWS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">✓</span>
                <span>MIT license</span>
              </li>
            </ul>
            <Link 
              href="https://github.com/mrpartnerai/taxrates-us#deploy-your-own-api"
              className="block text-center px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold transition"
            >
              Deploy Now
            </Link>
          </div>
        </div>
      </section>

      {/* Supported States */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold mb-12 text-center">Supported States</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 rounded-lg">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left">State</th>
                <th className="px-6 py-4 text-left">Code</th>
                <th className="px-6 py-4 text-left">Base Rate</th>
                <th className="px-6 py-4 text-left">Jurisdictions</th>
                <th className="px-6 py-4 text-left">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr className="bg-gray-800/30">
                <td className="px-6 py-4 font-semibold">California</td>
                <td className="px-6 py-4">CA</td>
                <td className="px-6 py-4">7.25%</td>
                <td className="px-6 py-4">546</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-green-600/20 text-green-400 text-sm">
                    Cities, counties, districts
                  </span>
                </td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="px-6 py-4 font-semibold">Texas</td>
                <td className="px-6 py-4">TX</td>
                <td className="px-6 py-4">6.25%</td>
                <td className="px-6 py-4">9</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-sm">
                    Major cities
                  </span>
                </td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="px-6 py-4 font-semibold">New York</td>
                <td className="px-6 py-4">NY</td>
                <td className="px-6 py-4">4.00%</td>
                <td className="px-6 py-4">7</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-sm">
                    Major cities
                  </span>
                </td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="px-6 py-4 font-semibold">Florida</td>
                <td className="px-6 py-4">FL</td>
                <td className="px-6 py-4">6.00%</td>
                <td className="px-6 py-4">1</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-400 text-sm">
                    Base rate
                  </span>
                </td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="px-6 py-4 font-semibold">Washington</td>
                <td className="px-6 py-4">WA</td>
                <td className="px-6 py-4">6.50%</td>
                <td className="px-6 py-4">1</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-400 text-sm">
                    Base rate
                  </span>
                </td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="px-6 py-4 font-semibold">Nevada</td>
                <td className="px-6 py-4">NV</td>
                <td className="px-6 py-4">6.85%</td>
                <td className="px-6 py-4">1</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-400 text-sm">
                    Base rate
                  </span>
                </td>
              </tr>
              <tr className="bg-gray-800/30">
                <td className="px-6 py-4 font-semibold">Oregon</td>
                <td className="px-6 py-4">OR</td>
                <td className="px-6 py-4">0.00%</td>
                <td className="px-6 py-4">1</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-gray-600/20 text-gray-400 text-sm">
                    No sales tax
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="text-gray-400">
              <p className="font-semibold text-white mb-1">taxrates-us</p>
              <p className="text-sm">Open source US sales tax rate API</p>
            </div>
            <div className="flex gap-6">
              <Link href="https://github.com/mrpartnerai/taxrates-us" className="text-gray-400 hover:text-white transition">
                GitHub
              </Link>
              <Link href="https://www.npmjs.com/package/taxrates-us" className="text-gray-400 hover:text-white transition">
                npm
              </Link>
              <Link href="https://github.com/mrpartnerai/taxrates-us/issues" className="text-gray-400 hover:text-white transition">
                Issues
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>MIT License • Created by <Link href="https://github.com/mrpartnerai" className="text-blue-400 hover:underline">mrpartner</Link></p>
            <p className="mt-2 text-xs">For informational purposes only. Not tax advice. Verify rates for production use.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
