# Testing Admin Add Items Functionality

## Test Instructions

Follow these steps to test that the admin can add items (products) to the database:

### Prerequisites

1. Make sure your dev server is running: `npm run dev`
2. You should have an admin user account (role = 'ADMIN')
3. You should have at least one category in your database

---

## Test Steps

### 1. Login as Admin

- Navigate to: `http://localhost:3000/login`
- Login with admin credentials
- **Expected Result**: You should be redirected to `/admin` (Admin Dashboard)

### 2. Navigate to Products Management

- From the Admin Dashboard, click on "Manage Products" card
- **Expected Result**: You should see the products list page at `/admin/products`

### 3. Click "Add Product" Button

- On the products page, click the "Add Product" button in the top right
- **Expected Result**: You should be redirected to `/admin/products/new`

### 4. Fill Out the Product Form

Fill in the following test data:

- **Product Name**: "Test Product" (required)
- **Description**: "This is a test product description" (optional)
- **Price**: 29.99 (required)
- **Stock Quantity**: 50 (required)
- **Image URL**: `https://via.placeholder.com/300` (optional - you can use this placeholder or leave empty)
- **Category**: Select any available category (required)

### 5. Submit the Form

- Click the "Create Product" button
- **Expected Behavior**:
  - Button should disable
  - Button text changes to "Creating Product..."
  - A spinning icon appears next to the text
  - Loading state is visible

### 6. Verify Success

- After submission (1-2 seconds):
  - **Success message** should appear: "Product "Test Product" created successfully!"
  - After 1.5 seconds, you should be **redirected back** to `/admin/products`
  - Your new product should appear in the products list

### 7. Verify in Database

Open your browser console (F12) and check for these log messages:

```
Form submitted - starting product creation...
Sending product data: { name: "Test Product", ... }
API Response: { status: 201, result: { ... } }
Product created successfully: { ... }
```

---

## Troubleshooting

### If the button doesn't show loading:

- Check browser console for JavaScript errors
- Make sure you're logged in as an admin

### If you get "Category ID is required" error:

- Make sure you have categories in your database
- Run the seed script if needed: `npx prisma db seed`

### If you get authentication errors:

- Make sure you're logged in
- Check that your user has role='ADMIN'
- Try logging out and logging in again

### If the product doesn't appear in the list:

- Refresh the products page
- Check browser console for API errors
- Check server console for database errors

---

## What to Look For

### ✅ Success Indicators:

1. Loading spinner appears when clicking "Create Product"
2. Button text changes to "Creating Product..."
3. Success message displays
4. Automatic redirect to products list after 1.5 seconds
5. New product appears in the products table
6. Console logs show successful API calls

### ❌ Error Indicators:

- Red error message appears
- Form doesn't submit
- No redirect happens
- Product not in the list
- Console errors appear

---

## Expected Console Logs

### Client Side (Browser Console):

```
Form submitted - starting product creation...
Sending product data: { name: "Test Product", description: "This is a test product description", price: 29.99, stock: 50, imageUrl: "https://via.placeholder.com/300", categoryId: "xxx" }
API Response: { status: 201, result: { id: "xxx", name: "Test Product", ... } }
Product created successfully: { id: "xxx", name: "Test Product", ... }
```

### Server Side (Terminal/Console):

```
API: Received request to CREATE product (Admin)
API: Admin user xxx authenticated to CREATE product.
API: Create product request body: { name: "Test Product", description: "This is a test product description", price: 29.99, stock: 50, imageUrl: "https://via.placeholder.com/300", categoryId: "xxx" }
API: Successfully created product xxx
```

---

## Notes

- The form has built-in validation for all required fields
- Price must be a non-negative number
- Stock must be a non-negative integer
- Category must be selected from existing categories
- Image URL is optional (uses placeholder if not provided)
- All admin routes are protected and require ADMIN role
