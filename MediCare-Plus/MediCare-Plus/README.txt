MediCare+ Online Pharmacy — Project Structure
==============================================

This is a front-end only (HTML, CSS, JavaScript) multi-page website built
for an academic submission. There is no backend/server — all data shown
(medicines, prices, ratings) is hard-coded in the HTML, and the cart and
prescription upload are demonstrated using browser-side JavaScript only.

Folder layout
-------------
MediCare-Plus/
├── home.html         Landing page: hero, categories, featured medicines,
│                      chronic disease packs, features, testimonials
├── medicines.html     Full medicine catalog with live search and
│                      category filter tags (Prescription / OTC / Generic /
│                      Vitamins / Diabetic Care)
├── Uploadrx.html       Prescription upload form with file selection,
│                      field validation and an on-page confirmation
├── css/
│   └── style.css      One shared stylesheet used by all three pages
└── js/
    └── script.js      One shared script: navigation, cart, search/filter,
                       and the prescription upload logic

How the cart works
-------------------
Clicking "+" on any medicine saves it to the browser's localStorage, so the
cart total in the navbar icon stays correct as you move between pages.
Open the cart by clicking the basket icon, then adjust quantity, remove
items, or click "Proceed to Checkout" to simulate placing an order
(there is no real payment gateway).

How to run it
--------------
No build step is needed. Simply open home.html in any modern browser
with the css/ and js/ folders kept alongside it, or upload the whole
MediCare-Plus folder to your college's project hosting/server.

Suggested talking points for your viva
---------------------------------------
- Why the site is split into separate pages instead of one long page
  (clearer navigation, smaller files, realistic e-commerce structure)
- Why one shared style.css and script.js are used instead of copying
  CSS/JS into every page (DRY principle — one place to fix bugs/styles)
- How the cart persists across pages using localStorage
- How the search box and filter tags both narrow down the same product
  list using one applyFilters() function
- Why the prescription form is validated on the client side, and what
  would be added on a real backend (file storage, OCR, SMS/WhatsApp
  notifications, pharmacist dashboard)
