// src/shopify-app-bridge.js
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';

export function initAppBridge({ apiKey, shopOrigin, host }) {
  const app = createApp({
    apiKey,
    shopOrigin, // e.g. "shop-name.myshopify.com"
    host,       // host param from Shopify (only for embedded)
    forceRedirect: true, // keep app loaded properly
  });
  return { app, Redirect };
}

// Example usage in your top-level React component:
import React, { useEffect } from 'react';
import { initAppBridge } from './shopify-app-bridge';

export default function AppEntry(props) {
  useEffect(() => {
    const apiKey = process.env.REACT_APP_SHOPIFY_API_KEY;
    const shop = new URLSearchParams(window.location.search).get('shop');
    const host = new URLSearchParams(window.location.search).get('host');
    const { app, Redirect } = initAppBridge({ apiKey, shopOrigin: shop, host });
    // Use Redirect if you want to navigate to top-level or external pages safely:
    // Redirect.create(app).dispatch(Redirect.Action.REMOTE, 'https://your-external-url');
  }, []);

  return <YourRoutes />;
}
