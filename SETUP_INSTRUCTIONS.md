# MySQL / InfinityFree Setup Instructions

This guide walks you through setting up your Point of Sale (POS) & Inventory System using an external MySQL database (e.g., on InfinityFree or any PHP/MySQL hosting).

## 1. Prepare your MySQL Database
Create a new MySQL database on your hosting and run the following SQL commands to create the required tables:

```sql
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50)
);

CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    price DECIMAL(10,2),
    stock INT,
    image LONGTEXT
);

CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    totalPurchases DECIMAL(15,2)
);

CREATE TABLE sales (
    id VARCHAR(50) PRIMARY KEY,
    date DATETIME NOT NULL,
    items LONGTEXT, -- Stores JSON array
    total DECIMAL(15,2),
    customerId VARCHAR(50),
    customerName VARCHAR(255),
    customerPhone VARCHAR(50)
);

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    role VARCHAR(20),
    password VARCHAR(255),
    permissions LONGTEXT -- Stores JSON object
);
```

## 2. Upload the API Bridge
1. In the application, go to **Settings**.
2. Click **Download PHP API Bridge**. (IMPORTANT: If you previous uploaded an older version, you MUST replace it with this new version to fix the "Failed to fetch" errors).
3. Upload the downloaded `pos_api.php` file to your hosting (usually in the `public_html` or `htdocs` folder).

## 3. Configure the System
1. Login to your POS system as an administrator.
2. Navigate to the **Settings** page.
3. In the **MySQL Database Configuration** section:
   * Check **Enable MySQL Storage**.
   * **API Bridge URL:** Enter the full URL to the file you uploaded (e.g., `https://khajaauto.page.gd/pos_api.php`).
   * **Database Host:** Enter your database host (usually `localhost` or a specific hostname provided by your host).
   * **Database Name:** Enter your MySQL database name.
   * **Database User:** Enter your MySQL username.
   * **Database Password:** Enter your MySQL password.
4. Click **Save Changes**.
5. The system will now automatically sync your data to the MySQL database and fetch from it on startup!

## 4. Hosting the System Yourself (Recommended to bypass CORS & Security blocks)

If your hosting provider blocks API requests from other domains (which often happens on InfinityFree and other shared hosts), the best solution is to host the POS application directly on the same domain as your database. This completely avoids "Failed to fetch" and CORS errors.

### Step 4A: Export the App Code
1. Click the "Share" or "Export" option in the AI Studio platform to download the code as a ZIP file.
2. Extract the downloaded `.zip` file on your computer.

### Step 4B: Build the App (requires Node.js)
This app is built with modern React. Before uploading, it must be compiled into standard HTML/JS files.
1. Download and install **Node.js** (https://nodejs.org) on your computer.
2. Extract the downloaded `.zip` folder. **Important for Windows Users:** Extract it to a folder with a simple name like `pos-system` directly on your Desktop or Documents (e.g. `C:\Users\YourName\Desktop\pos-system`). Avoid folder names starting with dashes like `-solar-point-pos`.
3. Open a terminal or command prompt inside the extracted project folder.
4. Run the following command to install dependencies:
   ```bash
   npm install
   ```
5. Run the following command to build the project:
   ```bash
   npm run build
   ```
   *(If you get a "vite: not found" or ".bin is not recognized" error, simply run `npx vite build` instead).*

### Step 4C: Upload to your Hosting
1. After the build completes, a new folder named `dist` will be created inside the project directory.
2. Open your hosting File Manager or FTP client (like FileZilla).
3. Upload **everything INSIDE the `dist` folder** directly to your hosting's public directory (e.g., `public_html` or `htdocs`).
4. Upload the `pos_api.php` file into the exactly same `public_html` folder.
5. Visit your website domain (e.g. `https://yourdomain.com`).
6. Because the POS app and the `pos_api.php` are now hosted together on the same server, the browser will no longer block the connection. Go into the system Settings and use your database credentials as before.

## Troubleshooting
* **Failed to fetch / Connection Error ("InfinityFree blocks API requests"):** 
    - **SECURITY BLOCK:** Providers like InfinityFree have security systems (like an AES challenge or bot protection) that check browser cookies. Even if `test.php` works when you visit it directly, InfinityFree will BLOCK automated API requests coming from this app because it is on a different domain.
    - **How to fix:** You unfortunately cannot use InfinityFree for an external API bridge *while hosting the app elsewhere*. You MUST follow **Section 4: Hosting the System Yourself** to put both the app and the `pos_api.php` on the same domain to fix this.
    - **SSL Requirements:** Use `https://` for your API Bridge URL.
* **Database Connection failed:** The PHP bridge is working, but it cannot connect to the MySQL server. Verify your Host, Name, User, and Password in the Settings.
    - **cPanel tip:** If using cPanel, creating a database and a user is not enough. You MUST also "Add User to Database" and grant "All Privileges".
    - **HTTP Error 500:** If you see an `HTTP Error: 500` after connecting successfully, it means the tables were not created. Download the PHP API Bridge again (which now auto-creates tables) and replace the old file.
* **Missing Credentials error:** Ensure you have saved your settings after enabling MySQL. The new bridge requires a POST body with the credentials.
