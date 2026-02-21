# TaxRates-US Widget Specification
**Version:** 1.0  
**Last Updated:** 2026-02-12  
**Product:** Embeddable Tax Calculator Widget

---

## 1. Overview

### Product Description
A lightweight, embeddable JavaScript widget that provides real-time sales tax calculations for e-commerce sites. Users pay $19/month for unlimited widget usage, requiring a taxrates-us Pro tier subscription for API access.

### Value Proposition
- **For merchants:** Simple copy-paste integration, accurate tax estimates improve checkout transparency
- **For customers:** See estimated tax before checkout, reducing cart abandonment
- **For taxrates-us:** Recurring revenue stream, drives Pro tier subscriptions

---

## 2. Technical Architecture

### 2.1 Component Overview
```
┌─────────────────┐
│  E-commerce     │
│  Website        │
│  (Client)       │
└────────┬────────┘
         │
         │ <script> tag
         ↓
┌─────────────────┐
│  CDN-hosted     │
│  Widget JS      │
│  (taxrates.js)  │
└────────┬────────┘
         │
         │ API requests
         ↓
┌─────────────────┐
│  TaxRates-US    │
│  Widget API     │
│  (Backend)      │
└────────┬────────┘
         │
         │ Tax calculation
         ↓
┌─────────────────┐
│  Core Tax API   │
│  (Pro tier)     │
└─────────────────┘
```

### 2.2 Widget Core (`taxrates.min.js`)
- **Size target:** <15KB minified + gzipped
- **Dependencies:** None (vanilla JS)
- **Browser support:** Last 2 versions of major browsers, IE11+
- **Framework agnostic:** Works with React, Vue, vanilla HTML

### 2.3 Widget API Endpoints

#### Base URL
```
https://widget.taxrates-us.com/api/v1
```

#### Endpoints

**POST /calculate**
```json
{
  "api_key": "wgt_xxxxxxxxxxxx",
  "address": {
    "zip": "90210",
    "city": "Beverly Hills",  // optional
    "state": "CA",            // optional
    "street": "123 Main St"   // optional for enhanced accuracy
  },
  "amount": 99.99,
  "currency": "USD"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "subtotal": 99.99,
    "tax_rate": 0.0950,
    "tax_amount": 9.50,
    "total": 109.49,
    "jurisdiction": "Los Angeles County, CA",
    "rate_breakdown": [
      {"type": "state", "rate": 0.0625, "amount": 6.25},
      {"type": "county", "rate": 0.0200, "amount": 2.00},
      {"type": "city", "rate": 0.0125, "amount": 1.25}
    ]
  },
  "cached": false,
  "timestamp": "2026-02-12T16:32:00Z"
}
```

**GET /config**
```
GET /config?api_key=wgt_xxxxxxxxxxxx
```

Response:
```json
{
  "success": true,
  "config": {
    "theme": "default",
    "brand_color": "#4A90E2",
    "show_breakdown": true,
    "auto_calculate": true,
    "rate_limits": {
      "per_minute": 100,
      "per_day": 10000
    }
  }
}
```

---

## 3. Widget Implementation

### 3.1 Basic Embed Code

**Minimal Setup (Generic HTML)**
```html
<!-- Include widget script -->
<script src="https://cdn.taxrates-us.com/widget/v1/taxrates.min.js"></script>

<!-- Widget container -->
<div id="tax-calculator" data-api-key="wgt_xxxxxxxxxxxx"></div>

<!-- Initialize -->
<script>
  TaxRatesWidget.init({
    container: '#tax-calculator',
    apiKey: 'wgt_xxxxxxxxxxxx'
  });
</script>
```

### 3.2 Advanced Configuration
```javascript
TaxRatesWidget.init({
  container: '#tax-calculator',
  apiKey: 'wgt_xxxxxxxxxxxx',
  
  // Styling
  theme: 'default', // 'default', 'minimal', 'bordered', 'custom'
  brandColor: '#4A90E2',
  customCSS: 'https://yoursite.com/custom-widget.css',
  
  // Behavior
  autoCalculate: true,  // Calculate on input change
  showBreakdown: true,  // Show state/county/city breakdown
  debounceMs: 500,      // Delay before auto-calculation
  
  // Pre-fill
  amount: 99.99,
  zip: '90210',
  
  // Callbacks
  onCalculate: function(result) {
    console.log('Tax calculated:', result);
  },
  onError: function(error) {
    console.error('Widget error:', error);
  }
});
```

### 3.3 Programmatic API
```javascript
// Get widget instance
const widget = TaxRatesWidget.getInstance('#tax-calculator');

// Calculate tax
widget.calculate({
  zip: '10001',
  amount: 149.99
}).then(result => {
  console.log('Tax:', result.tax_amount);
});

// Update amount
widget.setAmount(199.99);

// Update styling
widget.setTheme('minimal');

// Destroy widget
widget.destroy();
```

---

## 4. Platform Integrations

### 4.1 Shopify Integration

**App Installation**
```liquid
<!-- In theme.liquid or cart page -->
{% if settings.taxrates_widget_enabled %}
<script src="https://cdn.taxrates-us.com/widget/v1/taxrates.min.js"></script>
<script>
  TaxRatesWidget.init({
    container: '#tax-calculator',
    apiKey: '{{ settings.taxrates_api_key }}',
    amount: {{ cart.total_price | money_without_currency }},
    theme: '{{ settings.taxrates_theme }}',
    brandColor: '{{ settings.taxrates_brand_color }}',
    onCalculate: function(result) {
      // Update cart summary
      document.getElementById('estimated-tax').innerText = 
        Shopify.formatMoney(result.tax_amount * 100);
    }
  });
  
  // Listen to cart updates
  document.addEventListener('cart:updated', function(e) {
    TaxRatesWidget.getInstance('#tax-calculator')
      .setAmount(e.detail.total_price / 100);
  });
</script>
{% endif %}
```

**Theme Settings (config/settings_schema.json)**
```json
{
  "name": "TaxRates Widget",
  "settings": [
    {
      "type": "checkbox",
      "id": "taxrates_widget_enabled",
      "label": "Enable tax calculator widget",
      "default": false
    },
    {
      "type": "text",
      "id": "taxrates_api_key",
      "label": "TaxRates-US Widget API Key",
      "info": "Get your key at taxrates-us.com/widget"
    },
    {
      "type": "select",
      "id": "taxrates_theme",
      "label": "Widget Theme",
      "options": [
        {"value": "default", "label": "Default"},
        {"value": "minimal", "label": "Minimal"},
        {"value": "bordered", "label": "Bordered"}
      ],
      "default": "default"
    },
    {
      "type": "color",
      "id": "taxrates_brand_color",
      "label": "Brand Color",
      "default": "#4A90E2"
    }
  ]
}
```

### 4.2 WooCommerce Plugin

**Plugin Structure**
```
taxrates-us-widget/
├── taxrates-us-widget.php
├── includes/
│   ├── class-widget-admin.php
│   ├── class-widget-frontend.php
│   └── class-api-client.php
├── assets/
│   ├── css/admin.css
│   └── js/admin.js
└── readme.txt
```

**Main Plugin File**
```php
<?php
/**
 * Plugin Name: TaxRates-US Widget
 * Description: Embeddable tax calculator for WooCommerce
 * Version: 1.0.0
 * Author: TaxRates-US
 */

add_action('wp_enqueue_scripts', 'taxrates_widget_enqueue');
function taxrates_widget_enqueue() {
    if (is_cart() || is_checkout()) {
        wp_enqueue_script(
            'taxrates-widget',
            'https://cdn.taxrates-us.com/widget/v1/taxrates.min.js',
            array(),
            '1.0.0',
            true
        );
        
        wp_add_inline_script('taxrates-widget', "
            jQuery(document).ready(function($) {
                TaxRatesWidget.init({
                    container: '#taxrates-calculator',
                    apiKey: '" . get_option('taxrates_api_key') . "',
                    amount: parseFloat($('.cart-subtotal .amount').text().replace(/[^0-9.]/g, '')),
                    theme: '" . get_option('taxrates_theme', 'default') . "',
                    brandColor: '" . get_option('taxrates_brand_color', '#4A90E2') . "'
                });
            });
        ");
    }
}

// Settings page
add_action('admin_menu', 'taxrates_widget_menu');
function taxrates_widget_menu() {
    add_options_page(
        'TaxRates-US Widget',
        'TaxRates Widget',
        'manage_options',
        'taxrates-widget',
        'taxrates_widget_settings_page'
    );
}

function taxrates_widget_settings_page() {
    ?>
    <div class="wrap">
        <h1>TaxRates-US Widget Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('taxrates_widget_settings');
            do_settings_sections('taxrates-widget');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}
```

### 4.3 Generic HTML/JavaScript Sites

**Example: Single Page Checkout**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Checkout</title>
    <script src="https://cdn.taxrates-us.com/widget/v1/taxrates.min.js"></script>
    <style>
        .checkout-summary { max-width: 400px; margin: 20px auto; }
        .line-item { display: flex; justify-content: space-between; margin: 10px 0; }
        .total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="checkout-summary">
        <h2>Order Summary</h2>
        
        <div class="line-item">
            <span>Subtotal:</span>
            <span id="subtotal">$99.99</span>
        </div>
        
        <!-- Tax calculator widget -->
        <div id="tax-calculator"></div>
        
        <div class="line-item">
            <span>Estimated Tax:</span>
            <span id="tax-amount">$0.00</span>
        </div>
        
        <div class="line-item total">
            <span>Total:</span>
            <span id="total-amount">$99.99</span>
        </div>
        
        <div>
            <label>ZIP Code:</label>
            <input type="text" id="zip-input" placeholder="12345" maxlength="5">
        </div>
    </div>

    <script>
        const subtotal = 99.99;
        
        const widget = TaxRatesWidget.init({
            container: '#tax-calculator',
            apiKey: 'wgt_xxxxxxxxxxxx',
            amount: subtotal,
            theme: 'minimal',
            showBreakdown: true,
            autoCalculate: false,
            
            onCalculate: function(result) {
                document.getElementById('tax-amount').innerText = 
                    '$' + result.tax_amount.toFixed(2);
                document.getElementById('total-amount').innerText = 
                    '$' + result.total.toFixed(2);
            },
            
            onError: function(error) {
                alert('Error calculating tax: ' + error.message);
            }
        });
        
        // Manual calculation on ZIP change
        document.getElementById('zip-input').addEventListener('input', function(e) {
            const zip = e.target.value;
            if (zip.length === 5) {
                widget.calculate({ zip: zip, amount: subtotal });
            }
        });
    </script>
</body>
</html>
```

---

## 5. Styling & Customization

### 5.1 Built-in Themes

**Default Theme**
```css
.taxrates-widget {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #fff;
}

.taxrates-widget__title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
}

.taxrates-widget__amount {
    font-size: 24px;
    font-weight: 700;
    color: var(--brand-color, #4A90E2);
}
```

**Minimal Theme**
```css
.taxrates-widget--minimal {
    border: none;
    padding: 10px 0;
    background: transparent;
}

.taxrates-widget--minimal .taxrates-widget__title {
    font-size: 14px;
    font-weight: 500;
    color: #666;
}
```

**Bordered Theme**
```css
.taxrates-widget--bordered {
    border: 2px solid var(--brand-color, #4A90E2);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

### 5.2 Custom Styling

**CSS Custom Properties**
```css
.taxrates-widget {
    --brand-color: #4A90E2;
    --text-color: #333;
    --border-color: #e0e0e0;
    --background-color: #fff;
    --font-family: inherit;
    --border-radius: 8px;
    --padding: 15px;
}
```

**Override Styles**
```html
<style>
    .taxrates-widget {
        --brand-color: #FF6B35;
        --border-radius: 4px;
        font-family: 'Inter', sans-serif;
    }
    
    .taxrates-widget__amount {
        font-size: 28px !important;
    }
</style>
```

### 5.3 Dark Mode Support
```css
@media (prefers-color-scheme: dark) {
    .taxrates-widget {
        --text-color: #fff;
        --border-color: #444;
        --background-color: #1a1a1a;
    }
}
```

---

## 6. Pricing Model

### 6.1 Widget Subscription
- **Price:** $19/month per domain
- **Includes:**
  - Unlimited calculations
  - 10,000 API requests/day per key
  - 100 requests/minute rate limit
  - All widget features (themes, callbacks, customization)
  - Email support
  - 99.9% uptime SLA

### 6.2 Requirements
- Active TaxRates-US **Pro tier** subscription ($49/month)
- Total cost: **$68/month** (Pro + Widget)

### 6.3 Multi-Domain Pricing
- 1-5 domains: $19/month per domain
- 6-20 domains: $15/month per domain
- 21+ domains: Custom enterprise pricing

### 6.4 Free Trial
- 14-day free trial
- Full feature access
- No credit card required
- 1,000 requests during trial

### 6.5 Revenue Projection
**Conservative (Year 1)**
- 100 widget customers × $19/mo = $1,900/mo = **$22,800/year**
- 50 Pro upgrades × $49/mo = $2,450/mo = **$29,400/year**
- Total: **$52,200/year**

**Optimistic (Year 1)**
- 500 widget customers × $19/mo = $9,500/mo = **$114,000/year**
- 200 Pro upgrades × $49/mo = $9,800/mo = **$117,600/year**
- Total: **$231,600/year**

---

## 7. Implementation Plan

### Phase 1: Core Development (Weeks 1-3)
**Week 1: Backend API**
- [ ] Set up widget API subdomain (widget.taxrates-us.com)
- [ ] Implement `/calculate` endpoint with authentication
- [ ] Implement `/config` endpoint for theme settings
- [ ] Set up rate limiting (100/min, 10k/day)
- [ ] Add caching layer (Redis) for common ZIP codes
- [ ] Create widget API key generation system

**Week 2: Widget Core**
- [ ] Build vanilla JS widget framework
- [ ] Implement address input component (ZIP, optional full address)
- [ ] Implement amount input/display
- [ ] Build API client with error handling
- [ ] Add debouncing for auto-calculate
- [ ] Implement callback system (onCalculate, onError)

**Week 3: Styling & Themes**
- [ ] Create default theme CSS
- [ ] Create minimal & bordered themes
- [ ] Implement CSS custom properties system
- [ ] Add dark mode support
- [ ] Build theme configuration dashboard
- [ ] Test accessibility (WCAG 2.1 AA compliance)

### Phase 2: Platform Integrations (Weeks 4-5)
**Week 4: Shopify & WooCommerce**
- [ ] Build Shopify app with theme settings
- [ ] Create WooCommerce plugin
- [ ] Write installation documentation
- [ ] Test cart/checkout page integration
- [ ] Create video tutorials

**Week 5: Documentation & Examples**
- [ ] Write integration guides (HTML, React, Vue)
- [ ] Create CodePen/JSFiddle examples
- [ ] Build demo site (demo.taxrates-us.com/widget)
- [ ] Write API reference documentation
- [ ] Create troubleshooting guide

### Phase 3: Launch Preparation (Week 6)
- [ ] Set up CDN (Cloudflare or AWS CloudFront)
- [ ] Configure monitoring (Sentry for errors, Datadog for performance)
- [ ] Load testing (simulate 10k concurrent users)
- [ ] Security audit (OWASP top 10 checks)
- [ ] Create widget signup flow on main site
- [ ] Set up Stripe billing for $19/mo subscription
- [ ] Write launch announcement email/blog post

### Phase 4: Launch & Growth (Week 7+)
- [ ] Soft launch to 20 beta users
- [ ] Gather feedback and iterate
- [ ] Public launch with marketing push
- [ ] Monitor usage and performance
- [ ] Add features based on user requests

---

## 8. Technical Requirements

### 8.1 Frontend
- **Language:** Vanilla JavaScript (ES6+)
- **Build:** Webpack 5 with Babel
- **Size:** <15KB minified + gzipped
- **Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, IE11 (with polyfills)
- **Testing:** Jest + Puppeteer

### 8.2 Backend
- **Runtime:** Node.js 18+ or Python 3.11+
- **Framework:** Express.js or FastAPI
- **Database:** PostgreSQL 14+ for widget configs, Redis for caching
- **Authentication:** API key-based (Bearer token)
- **Rate Limiting:** Redis-backed sliding window
- **Monitoring:** Sentry (errors), Datadog (APM)

### 8.3 Infrastructure
- **CDN:** Cloudflare or AWS CloudFront
- **Hosting:** AWS (EC2/ECS) or Vercel Edge
- **Cache:** Redis (ElastiCache or Upstash)
- **SSL:** Let's Encrypt or AWS Certificate Manager
- **Uptime SLA:** 99.9% (43.8 minutes downtime/month max)

---

## 9. Security Considerations

### 9.1 API Key Protection
- Widget API keys start with `wgt_` prefix
- Keys are scoped to domains (CORS restrictions)
- Rotating keys available in dashboard
- Automatic key expiration after 1 year (with warning)

### 9.2 Rate Limiting
```javascript
// Per API key
const rateLimits = {
  perMinute: 100,   // Burst protection
  perHour: 2000,    // Sustained load protection
  perDay: 10000     // Daily quota
};
```

### 9.3 Input Validation
- ZIP code: 5 or 9 digits (XXXXX or XXXXX-XXXX)
- Amount: Positive number, max $1,000,000
- Address fields: Alphanumeric + common punctuation only
- SQL injection protection on all inputs

### 9.4 CORS Policy
```javascript
// Only allow requests from registered domains
Access-Control-Allow-Origin: https://customer-site.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 10. Analytics & Monitoring

### 10.1 Usage Metrics
- Total calculations per day/month
- Average response time
- Error rate by endpoint
- Most queried ZIP codes
- Peak usage times

### 10.2 Business Metrics
- Active widget subscriptions
- Churn rate
- Average calculations per customer
- Trial conversion rate
- Revenue per customer

### 10.3 Dashboard (Admin)
```
┌─────────────────────────────────────┐
│ Widget Dashboard                     │
├─────────────────────────────────────┤
│ Active Subscriptions: 157            │
│ Calculations Today: 45,231           │
│ Avg Response Time: 142ms             │
│ Error Rate: 0.03%                    │
│                                      │
│ Top Customers by Usage:              │
│ 1. acme-corp.com - 8,432 req/day    │
│ 2. shop-example.com - 6,129 req/day │
│ 3. store-demo.com - 4,801 req/day   │
└─────────────────────────────────────┘
```

---

## 11. Support & Documentation

### 11.1 Documentation Site
- **URL:** docs.taxrates-us.com/widget
- **Sections:**
  - Quick Start Guide
  - API Reference
  - Integration Guides (Shopify, WooCommerce, etc.)
  - Customization Examples
  - Troubleshooting
  - FAQ

### 11.2 Support Channels
- Email: widget-support@taxrates-us.com
- Response time: <24 hours for paid customers
- Documentation: Searchable knowledge base
- Community: Discord or Slack channel (optional)

### 11.3 Status Page
- **URL:** status.taxrates-us.com
- Real-time API status
- Historical uptime data
- Scheduled maintenance announcements

---

## 12. Future Enhancements (Post-Launch)

### Phase 2 Features
- [ ] Multi-currency support
- [ ] International tax rates (Canada, EU VAT)
- [ ] Product-specific tax categories (food, clothing exemptions)
- [ ] Tax holiday detection (back-to-school, etc.)
- [ ] Webhooks for tax rate changes

### Phase 3 Features
- [ ] React/Vue/Angular component libraries
- [ ] Mobile SDK (iOS/Android)
- [ ] Tax exemption certificate handling
- [ ] Marketplace integration (Etsy, eBay, Amazon)
- [ ] White-label option for enterprise

---

## 13. Sample Embed Codes

### 13.1 Minimal (Copy-Paste)
```html
<div id="tax-calculator"></div>
<script src="https://cdn.taxrates-us.com/widget/v1/taxrates.min.js"></script>
<script>
  TaxRatesWidget.init({
    container: '#tax-calculator',
    apiKey: 'wgt_xxxxxxxxxxxx',
    amount: 99.99
  });
</script>
```

### 13.2 Custom Styling
```html
<div id="tax-calculator"></div>
<script src="https://cdn.taxrates-us.com/widget/v1/taxrates.min.js"></script>
<script>
  TaxRatesWidget.init({
    container: '#tax-calculator',
    apiKey: 'wgt_xxxxxxxxxxxx',
    amount: 149.99,
    theme: 'bordered',
    brandColor: '#FF6B35',
    showBreakdown: true,
    autoCalculate: true
  });
</script>
```

### 13.3 With Callbacks (Advanced)
```html
<div id="tax-calculator"></div>
<script src="https://cdn.taxrates-us.com/widget/v1/taxrates.min.js"></script>
<script>
  TaxRatesWidget.init({
    container: '#tax-calculator',
    apiKey: 'wgt_xxxxxxxxxxxx',
    amount: 199.99,
    
    onCalculate: function(result) {
      // Update your checkout summary
      document.getElementById('total-tax').innerText = 
        '$' + result.tax_amount.toFixed(2);
      document.getElementById('grand-total').innerText = 
        '$' + result.total.toFixed(2);
      
      // Send to analytics
      gtag('event', 'tax_calculated', {
        'amount': result.tax_amount,
        'jurisdiction': result.jurisdiction
      });
    },
    
    onError: function(error) {
      console.error('Tax calculation error:', error);
      // Fallback to default tax rate
      document.getElementById('total-tax').innerText = 'Est. $18.00';
    }
  });
</script>
```

---

## 14. Success Metrics (6 Months Post-Launch)

### Target KPIs
- **Customer Acquisition:** 200+ active widget subscriptions
- **Revenue:** $3,800/month from widget + $4,900/month from Pro upgrades = **$8,700/month**
- **Uptime:** 99.95%+ actual uptime
- **Performance:** <200ms average API response time
- **Churn:** <5% monthly churn rate
- **NPS Score:** 50+ (promoters - detractors)

### Growth Indicators
- 10%+ month-over-month customer growth
- 50%+ trial-to-paid conversion rate
- 30%+ of widget customers upgrade to Pro
- 80%+ customer satisfaction rating

---

## Appendix A: API Key Formats

```
Widget API Key: wgt_live_4f8a2b9c1e3d5a7f9b2c4e6a8d0f1b3d
Widget Test Key: wgt_test_9b2c4e6a8d0f1b3d4f8a2b9c1e3d5a7f

Pro API Key:    api_live_7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d
Pro Test Key:   api_test_3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d
```

## Appendix B: Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid ZIP code | ZIP must be 5 or 9 digits |
| 401 | Invalid API key | Key not found or expired |
| 403 | Domain not authorized | CORS check failed |
| 429 | Rate limit exceeded | Too many requests |
| 500 | Calculation error | Internal server error |
| 503 | Service unavailable | Temporary outage |

## Appendix C: CDN Endpoints

**Production:**
- `https://cdn.taxrates-us.com/widget/v1/taxrates.min.js`
- `https://cdn.taxrates-us.com/widget/v1/taxrates.min.css`

**Staging:**
- `https://cdn-staging.taxrates-us.com/widget/v1/taxrates.min.js`

**Versioning:**
- Locked version: `v1.2.3/taxrates.min.js`
- Latest v1: `v1/taxrates.min.js` (auto-updates minor/patch)
- Latest: `latest/taxrates.min.js` (use with caution)

---

**End of Specification**

*For questions or feedback, contact: product@taxrates-us.com*
