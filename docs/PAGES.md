# Public product and purchase pages

All public commercial routes share `app/_public/public-shell.tsx` and scoped `public.module.css`: responsive navigation, branded footer, skip link, focus states and reduced-motion support. Product illustrations are explicitly labeled as illustrative, not customer evidence. No invented metrics or testimonials.

| Route | Purpose |
| --- | --- |
| `/product` | Product story, workflow and account entry |
| `/pricing` | Build/Growth reference pricing, feature comparison and checkout links |
| `/plans/build` | Build detail and checkout |
| `/plans/growth` | Growth detail and checkout |
| `/checkout?plan=build` or `growth` | Account-aware summary and test checkout |
| `/checkout/success` | Read-only subscription verification with manual refresh |
| `/checkout/canceled` | Return to plans/account without changing subscription |
| `/help` | Accessible native-disclosure FAQ |

## Real account and billing behavior

`CheckoutClient` requests `GET /api/account` with no-store and a timeout. Signed-out visitors receive registration/sign-in links that preserve `plan` and an encoded local `next`. Unknown plan values default to Build. Loading, request errors, authenticated, existing active subscription, unavailable billing and configured test billing are explicit states.

The checkout button posts `{plan}` to `POST /api/billing/checkout`. Server failures are rendered, double submission is blocked, and only HTTPS `checkout.stripe.com` redirects are accepted. No card information is collected by this frontend. API authorization and price validation remain on the server.

The success page checks only `/api/account`; it never grants entitlement or trusts a query parameter as payment proof. It reports active/trialing only from the server account response. Failed lookups can be retried. The canceled page does not claim to know whether another payment succeeded.

## Deployment dependencies and limits

Billing is test-only and requires the existing server configuration, database billing operations and authenticated organization. Pages honestly explain unavailable billing; they do not simulate success. Prices are reference prices, not a live commercial offer. Usage quotas, tax treatment and final terms are not invented. Mentorship is separate and remote AI depends on configuration.

The billing server should return to `/checkout/success` and `/checkout/canceled`; it must preserve authoritative webhook reconciliation. The access implementation must support a local `next` return path and preserve selected plan across account creation. These are integrations owned by the server/auth flow, not implemented by the public page components.
