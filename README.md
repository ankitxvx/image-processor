# Image Processing System

## Overview

This project implements a system for processing images from CSV files. It includes:

- **Database Schema**: MongoDB collections for tracking requests and products.
- **API Endpoints**: Upload CSV, check request status, and download output CSV.
- **Asynchronous Workers**: Background processing of image compression.
- **GitHub Repository**: Full source code and setup instructions.
- **Postman Collection**: Preconfigured API requests for testing.

---

## Database Schema

### Requests Collection
Stores metadata about each processing request.

| Field       | Type      | Description                                     |
|-------------|-----------|-------------------------------------------------|
| `_id`       | ObjectId  | MongoDB-generated unique identifier             |
| `requestId` | String    | Unique identifier (e.g., UUID)                  |
| `status`    | String    | Status: "pending", "processing", "completed", "failed" |
| `error`     | String    | Optional error message if processing fails      |
| `webhookUrl`| String    | Optional URL to notify upon completion          |
| `createdAt` | Date      | Timestamp of creation                           |
| `updatedAt` | Date      | Timestamp of last update                        |

### Products Collection
Stores product data linked to a processing request.

| Field            | Type          | Description                                     |
|------------------|---------------|-------------------------------------------------|
| `_id`            | ObjectId      | MongoDB-generated unique identifier             |
| `requestId`      | String        | References `Requests.requestId`                 |
| `serialNumber`   | Number        | Serial number from the CSV                      |
| `productName`    | String        | Product name                                    |
| `inputImageUrls` | Array[String] | URLs of input images                            |
| `outputImageUrls`| Array[String] | URLs of processed images (empty initially)      |
| `status`         | String        | Status: "pending", "processing", "completed", "failed" |
| `error`          | String        | Optional error message if image processing fails|
| `createdAt`      | Date          | Timestamp of creation                           |
| `updatedAt`      | Date          | Timestamp of last update                        |

---


```
+--------------------+
|      Requests      |
+--------------------+
| _id: ObjectId      |
| requestId: String  |
| status: String     |
| webhookUrl: String |
| createdAt: Date    |
| updatedAt: Date    |
+--------------------+
          |
          | 1
          |
          | *
+--------------------+
|      Products      |
+--------------------+
| _id: ObjectId      |
| requestId: String  |
| serialNumber: Int  |
| productName: String|
| inputImageUrls: [String] |
| outputImageUrls: [String] |
| status: String     |
| error: String      |
| createdAt: Date    |
| updatedAt: Date    |
+--------------------+

```

## API Documentation

### 1. Upload API

**Endpoint**: `/upload`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`

**Request Body**:

- `file`: CSV file (required, columns: S. No., Product Name, Input Image URLs)
- `webhookUrl`: String (optional, URL for completion notification)

**Responses**:

- **200 OK**:
    ```json
    {
      "requestId": "550e8400-e29b-41d4-a716-446655440000"
    }
    ```
- **400 Bad Request**:
    ```json
    {
      "error": "Invalid CSV format"
    }
    ```
- **500 Internal Server Error**:
    ```json
    {
      "error": "Error parsing CSV"
    }
    ```

### 2. Status API

**Endpoint**: `/status/:requestId`  
**Method**: `GET`

**Parameters**:

- `requestId`: String (path parameter, e.g., UUID)

**Responses**:

- **200 OK (Pending/Processing)**:
    ```json
    {
      "status": "pending"
    }
    ```
- **200 OK (Completed)**:
    ```json
    {
      "status": "completed",
      "outputUrl": "/output/550e8400-e29b-41d4-a716-446655440000.csv"
    }
    ```
- **404 Not Found**:
    ```json
    {
      "error": "Request not found"
    }
    ```

### 3. Output CSV Endpoint

**Endpoint**: `/output/:requestId.csv`  
**Method**: `GET`

**Responses**:

- **200 OK** (CSV download):
    ```csv
    S. No.,Product Name,Input Image URLs,Output Image URLs
    1,SKU1,https://example.com/img1.jpg,/images/uuid1.jpg
    2,SKU2,https://example.com/img2.jpg,/images/uuid2.jpg
    ```
- **403 Forbidden**:
    ```json
    {
      "error": "Output not available or processing incomplete"
    }
    ```

---

## Asynchronous Workers

### 1. `processRequest(requestId)`

Processes all products associated with a request.

**Steps**:

1. Update request status to "processing".
2. Retrieve all products linked to the `requestId`.
3. Process each product via `processProduct` concurrently.
4. Update request status to "completed" when done.
5. Send a webhook notification if provided.

**Error Handling**: Updates status to "failed" on errors and logs the issue.

### 2. `processProduct(product)`

Processes images for a single product.

**Steps**:

1. Update product status to "processing".
2. Compress each input image to 50% quality.
3. Save compressed images and update `outputImageUrls`.
4. Update product status to "completed".

**Error Handling**: Logs errors and updates product status to "failed" if processing fails.

---

## GitHub Repository

The project structure:

```
project-root/
├── models/
│   ├── Request.js
│   └── Product.js
├── routes/
│   ├── upload.js
│   ├── status.js
│   └── output.js
├── workers/
│   └── processRequest.js
├── public/
│   └── images/
├── uploads/
├── app.js
└── package.json
```

### Setup Instructions

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd project-root
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the server:
    ```bash
    node app.js
    ```

**Dependencies**: Express, Mongoose, Multer, Sharp, Axios

---

## Postman Collection

A Postman collection is available to test the APIs. It includes:

1. **Upload CSV** (`POST /upload`)
2. **Check Status** (`GET /status/:requestId`)
3. **Download Output CSV** (`GET /output/:requestId.csv`)

### Import Instructions

1. Download `postman_collection.json` from the repository.
2. Import it into Postman.
3. Set the environment variable `baseUrl` (e.g., `http://localhost:3000`).

---


