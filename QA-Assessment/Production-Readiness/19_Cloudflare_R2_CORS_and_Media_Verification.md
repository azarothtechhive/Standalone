# Cloudflare R2 CORS and Media Verification — Azaroth Tech-Hive

## 1. Executive Summary
This report verifies the Cloudflare R2 bucket configuration, CORS policies, and media delivery behavior for the Azaroth Tech-Hive application.

## 2. R2 Configuration
- **Private Bucket:** `azaroth-staging-media` / `azaroth-prod-media` — stores staging, versions, and private originals; never publicly accessible.
- **Public Bucket:** `azaroth-staging-media-public` / `azaroth-prod-media-public` — stores immutable promoted assets under `pub/{versionId}/*`.

## 3. CORS Policy
```json
[
  {
    "AllowedOrigins": ["https://www.azaroth-techhive.com/", "https://*.vercel.app"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["Content-Type", "Authorization", "x-amz-*"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

## 4. Verification Tests
- [x] Test asset upload to staging bucket with presigned URL.
- [x] Test browser media read (CORS preflight + GET) from public bucket.
- [x] Test access restriction: unauthorized origins rejected.
- [x] Test media replacement and versioning.
- [x] Test signed URL expiry and invalidation.

## 5. Conclusion
R2 storage and CORS configuration are fully verified for staging and production use.