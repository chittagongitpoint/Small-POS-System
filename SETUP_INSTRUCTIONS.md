# Google Apps Script (GAS) Setup Instructions

**NOTE: Full Site Export**
The code provided by the "GAS Setup" tab generates a fully functional, single-page application (SPA) optimized for Google Apps Script using pure HTML, CSS (Tailwind), and Javascript. It includes the Dashboard, POS, Inventory, and User permissions system mirroring the preview environment!

This guide walks you through deploying your Point of Sale (POS) & Inventory System directly on Google Apps Script (GAS), using Google Sheets as the free database backend.

## 1. Create the Google Sheet Database
1. Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Name the spreadsheet (e.g., "Khaja Auto POS Database").
3. You will need to create the following sheets (tabs at the bottom of the screen):

### Sheet 1: `Products`
Create the following column headers in Row 1 (A1:E1):
* **ID** (A1)
* **Name** (B1)
* **Category** (C1)
* **Price** (D1)
* **Stock** (E1)

*(Optional) You can pre-fill some rows with your initial products starting from Row 2.*

### Sheet 2: `Sales`
Create the following column headers in Row 1 (A1:F1):
* **Sale ID** (A1)
* **Date** (B1)
* **Customer Name** (C1)
* **Customer Phone** (D1)
* **Total Amount** (E1)
* **Items Details** (F1) *(This will store a JSON dump of the cart items)*

### Sheet 3: `Categories`
Create the following column headers in Row 1 (A1:B1):
* **ID** (A1)
* **Name** (B1)

### Sheet 4: `Customers`
Create the following column headers in Row 1 (A1:D1):
* **ID** (A1)
* **Name** (B1)
* **Phone** (C1)
* **Total Purchases** (D1)

### Sheet 5: `Users`
Create the following column headers in Row 1 (A1:G1):
* **ID** (A1)
* **Name** (B1)
* **Email** (C1)
* **Phone** (D1)
* **Password** (E1)
* **Role** (F1) *(admin or staff)*
* **Permissions** (G1) *(JSON string of permissions, e.g., `{"dashboard":true,"pos":true}`)*

### Sheet 6: `Settings`
Create the following column headers in Row 1 (A1:D1):
* **System Name** (A1)
* **System Subtitle** (B1)
* **Phone** (C1)
* **Default Language** (D1) *(en or bn)*

## 2. Get Your Spreadsheet ID
1. Look at the URL of your Google Sheet. It looks like this:
   `https://docs.google.com/spreadsheets/d/1XyZ...abc123/edit#gid=0`
2. Your **Spreadsheet ID** is the long string of random characters between `/d/` and `/edit`.
3. Copy this ID. You will need it in the next step.

## 3. Create the Google Apps Script
1. In your Google Sheet, click on **Extensions** > **Apps Script**.
2. This opens the Apps Script code editor.
3. Rename the project at the top left from "Untitled project" to "POS System".

### Step 3a: `Code.gs`
1. You will see a file named `Code.gs`. Delete the default code inside it.
2. From your application's "GAS Setup" tab, click **Copy Code.gs**.
3. Paste the code into your `Code.gs` file in the Apps Script editor.
4. **IMPORTANT:** At the very top of `Code.gs`, replace `'YOUR_GOOGLE_SHEET_ID_HERE'` with the Spreadsheet ID you copied in Step 2.

### Step 3b: `Index.html`
1. In the Apps Script editor, click the `+` icon next to **Files** (on the left sidebar) and select **HTML**.
2. Name the file `Index` (it will automatically become `Index.html`).
3. Delete the default HTML code inside it.
4. From your application's "GAS Setup" tab, click **Copy Index.html**.
5. Paste the code into your `Index.html` file in the Apps Script editor.
6. Click the Save icon (or press Ctrl+S / Cmd+S) to save both files.

## 4. Deploy the Web App
1. At the top right of the Apps Script editor, click the blue **Deploy** button and select **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
3. Fill out the configuration form:
   * **Description:** "Initial POS Deployment" (or whatever you like).
   * **Execute as:** "Me ([your email])". *(This ensures the script has access to your Google Sheet)*
   * **Who has access:** Choose "Anyone" (or "Anyone with Google Account" depending on your security needs).
4. Click **Deploy**.
5. **Authorization:** Since this is your first time deploying, Google will ask you to authorize the script.
   * Click **Review permissions**.
   * Choose your Google account.
   * You may see a warning saying "Google hasn't verified this app." Click **Advanced** at the bottom, then click **Go to POS System (unsafe)**.
   * Click **Allow** to grant it access to view and manage your spreadsheets.
6. After authorization finishes, you will be given a **Web app URL**.
7. Copy this URL.

## 5. Use Your Application!
1. Paste the **Web app URL** into any browser.
2. You will see the Point of Sale system running! It will read products directly from your Google Sheet and write new sales directly to the `Sales` sheet.
3. Share this URL with your sales staff.

## Troubleshooting
* **"Loading..." stuck forever:** Ensure the Web App URL is opened in a new tab. If it's embedded, your browser might block third-party cookies or scripts.
* **Out of stock errors:** Ensure you have actually entered stock numbers greater than 0 in the 'Stock' column of your 'Products' sheet.
* **Saving sales fails:** Ensure all sheet names exactly match standard casing (`Products` and `Sales`). App scripts are case-sensitive.
