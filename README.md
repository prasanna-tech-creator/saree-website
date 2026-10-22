# Tharinayambyaisha — Responsive Saree Shopping Website

## Included
- `index.html`, `styles.css`, `script.js`: responsive storefront, filtering, product detail modal, cart and enquiry checkout.
- `products.js`: all 41 sarees from the supplied catalogue, including the source product IDs, descriptions, colour, body, border/pallu, look and occasion.
- `assets/images/`: the corresponding product photographs extracted from the supplied PDF.

## Run locally
1. Extract the ZIP.
2. Open `index.html` in a modern browser. For best results, run a local static server from this folder (for example, `python -m http.server 8000`) and open `http://localhost:8000`.

## Product data and pricing
The supplied catalogue does not specify prices or fabric composition. These fields are deliberately not invented; the site shows “Price on request” and checkout totals remain unconfirmed. The catalogue's listed visual descriptions and product IDs are retained. Images are extracted from the corresponding product pages.

## Updating products
Edit `products.js`. Each object includes `id`, `name`, `tagline`, `description`, `color`, `body`, `border`, `look`, `occasion`, `price`, `fabric`, and `image`. Place new image files in `assets/images/` and update the matching `image` path. Set `price` only when the boutique confirms a real price; the current UI intentionally avoids implying unknown prices.

## Functional scope
Works locally: search, colour/occasion filters, sorting by name, product details, adding/removing items, quantity changes, cart persistence using localStorage, form validation, and a local enquiry confirmation/reference.
Not integrated: real order submission, email/SMS notifications, inventory availability, customer database, shipping calculation, or payment gateway. The enquiry form is a front-end demo only; it does not send customer details to a business. Do not use it as a production checkout without a secure backend and privacy/security review.

## Contact information
Phone, email and business address were not provided in the source catalogue and have not been invented.
