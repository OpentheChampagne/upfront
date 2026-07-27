import { Category } from "@/lib/generated/prisma/client";

export interface Fingerprint {
  technology: string;
  category: Category;
  patterns: RegExp[];
}

export const FINGERPRINTS: Fingerprint[] = [
  // Pixel
  {
    technology: "Meta Pixel",
    category: Category.PIXEL,
    patterns: [/connect\.facebook\.net\/[^"'\s]*\/fbevents\.js/i, /fbq\(\s*['"]init['"]/i],
  },
  {
    technology: "Google Analytics 4",
    category: Category.PIXEL,
    patterns: [/googletagmanager\.com\/gtag\/js\?id=G-/i],
  },
  {
    technology: "Google Ads",
    category: Category.PIXEL,
    patterns: [/googletagmanager\.com\/gtag\/js\?id=AW-/i, /googleadservices\.com\/pagead/i],
  },
  {
    technology: "TikTok Pixel",
    category: Category.PIXEL,
    patterns: [/analytics\.tiktok\.com\/i18n\/pixel/i, /ttq\.load\(/i],
  },
  {
    technology: "Pinterest Tag",
    category: Category.PIXEL,
    patterns: [/s\.pinimg\.com\/ct\/core\.js/i, /pintrk\(\s*['"]load['"]/i],
  },
  {
    technology: "Snapchat Pixel",
    category: Category.PIXEL,
    patterns: [/sc-static\.net\/scevent\.min\.js/i, /snaptr\(\s*['"]init['"]/i],
  },
  {
    technology: "LinkedIn Insight Tag",
    category: Category.PIXEL,
    patterns: [/snap\.licdn\.com\/li\.lms-analytics\/insight\.min\.js/i],
  },
  {
    technology: "X (Twitter) Pixel",
    category: Category.PIXEL,
    patterns: [/static\.ads-twitter\.com\/uwt\.js/i],
  },

  // Commerce
  {
    technology: "Shopify",
    category: Category.COMMERCE,
    patterns: [/cdn\.shopify\.com/i, /Shopify\.shop\s*=/i, /\/cdn\/shop\//i],
  },
  {
    technology: "WooCommerce",
    category: Category.COMMERCE,
    patterns: [/wp-content\/plugins\/woocommerce/i, /woocommerce_params/i],
  },
  {
    technology: "BigCommerce",
    category: Category.COMMERCE,
    patterns: [/cdn11\.bigcommerce\.com/i],
  },
  {
    technology: "Magento",
    category: Category.COMMERCE,
    patterns: [/Mage\.Cookies/i, /static\/version\d+\/frontend/i],
  },
  {
    technology: "Stripe",
    category: Category.COMMERCE,
    patterns: [/js\.stripe\.com\/v3/i],
  },
  {
    technology: "Recharge",
    category: Category.COMMERCE,
    patterns: [/cdn\.rechargepayments\.com/i],
  },

  // Retention
  {
    technology: "Klaviyo",
    category: Category.RETENTION,
    patterns: [/static(?:-tracking)?\.klaviyo\.com\/onsite\/js\/klaviyo\.js/i, /_learnq\s*=/i],
  },
  {
    technology: "Attentive",
    category: Category.RETENTION,
    patterns: [/cdn\.attn\.tv\/[^"'\s]*\/dtag\.js/i],
  },
  {
    technology: "Postscript",
    category: Category.RETENTION,
    patterns: [/static\.postscript\.io/i, /sms\.postscript\.io/i],
  },
  {
    technology: "Yotpo",
    category: Category.RETENTION,
    patterns: [/staticw2\.yotpo\.com/i],
  },
  {
    technology: "Gorgias",
    category: Category.RETENTION,
    patterns: [/config\.gorgias\.chat/i],
  },
  {
    technology: "Okendo",
    category: Category.RETENTION,
    patterns: [/reviews\.okendo\.io/i],
  },

  // Tag manager
  {
    technology: "Google Tag Manager",
    category: Category.TAG_MANAGER,
    patterns: [/googletagmanager\.com\/gtm\.js/i],
  },
  {
    technology: "Segment",
    category: Category.TAG_MANAGER,
    patterns: [/cdn\.segment\.com\/analytics\.js/i],
  },
  {
    technology: "Tealium",
    category: Category.TAG_MANAGER,
    patterns: [/tags\.tiqcdn\.com/i],
  },
];
