## Inventory Management Website (Browser Only)

This is a simple **stock / inventory maintenance system** that runs completely in your browser using plain **HTML, CSS, and JavaScript**.  
No additional software, servers, or packages are required.

### How to Run

- **Step 1**: Open the folder `C:\Users\hp\Downloads\project`.
- **Step 2**: Double‑click `index.html`.
- The site will open in your default browser and is ready to use.

All data (products and stock movements) is stored in your browser’s **local storage**, so it will remain available even if you close and reopen the page (on the same browser and computer).

### Features

- **Product Management**
  - Add, edit, and delete products.
  - Fields: Name, SKU/Code, Category, Quantity, Reorder Level, Unit Price.
  - Automatic calculation of **total value** per product.
- **Stock In / Out**
  - Select a product and perform **Stock In** or **Stock Out** with quantity and optional notes.
  - Validations so you cannot remove more stock than available.
  - Recent movements table showing date/time, product, type, quantity, and note.
- **Dashboard**
  - Total products.
  - Total quantity across all products.
  - Total inventory value (₹).
  - Count of **low stock** items (quantity greater than 0 but less than or equal to reorder level).
- **Search & Status**
  - Search bar to filter products by name, SKU, or category.
  - Status badges: **OK**, **Low**, **Out of Stock**.

### Notes

- On first load, some **demo products** are added to show how it works.
- To reset everything, clear your browser’s **local storage** for this site.

