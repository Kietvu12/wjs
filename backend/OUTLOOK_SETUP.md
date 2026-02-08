# Hướng dẫn thiết lập Outlook Email Sync

## 1. Đăng ký ứng dụng trên Microsoft Azure

1. Truy cập [Azure Portal](https://portal.azure.com/)
2. Vào **Azure Active Directory** > **App registrations** > **New registration**
3. Điền thông tin:
   - **Name**: JobShare Email Sync
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Type: Web
     - URI: `http://localhost:3000/api/admin/emails/outlook/oauth/callback` (development)
     - URI: `https://yourdomain.com/api/admin/emails/outlook/oauth/callback` (production)
4. Sau khi tạo, lưu lại:
   - **Application (client) ID**
   - **Directory (tenant) ID**
5. Vào **Certificates & secrets** > **New client secret**
   - Lưu lại **Value** của secret (chỉ hiển thị 1 lần)

## 2. Cấu hình API Permissions

1. Vào **API permissions** > **Add a permission**
2. Chọn **Microsoft Graph** > **Delegated permissions**
3. Thêm các permissions:
   - `Mail.Read` - Đọc email
   - `Mail.Send` - Gửi email
   - `offline_access` - Refresh token
4. Click **Grant admin consent** (nếu có quyền)

## 3. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
# Microsoft Graph API
MICROSOFT_CLIENT_ID=your-application-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret-value
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/admin/emails/outlook/oauth/callback

# Frontend URL (cho OAuth callback)
FRONTEND_URL=http://localhost:5173
```

## 4. Chạy Migration

Chạy SQL migration để tạo các bảng:

```bash
mysql -u your_user -p your_database < backend/schema/migrations/create_outlook_tables.sql
```

Hoặc import file SQL vào database.

## 5. Sử dụng

### Kết nối tài khoản Outlook

1. Vào trang **Quản lý Email** trong admin panel
2. Click **Kết nối Outlook**
3. Đăng nhập với tài khoản `kietvu389@gmail.com`
4. Chấp nhận permissions
5. Hệ thống sẽ tự động lưu tokens

### Đồng bộ email

- **Thủ công**: Click nút **Đồng bộ** trên giao diện
- **Tự động**: Có thể setup cron job để gọi endpoint `/api/admin/emails/outlook/sync-all` định kỳ

### Cron Job Setup (tùy chọn)

Thêm vào crontab để đồng bộ tự động mỗi 15 phút:

```bash
*/15 * * * * curl -X POST http://localhost:3000/api/admin/emails/outlook/sync-all -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Hoặc sử dụng node-cron trong ứng dụng:

```javascript
import cron from 'node-cron';
import { emailSyncJob } from './jobs/emailSyncJob.js';

// Đồng bộ mỗi 15 phút
cron.schedule('*/15 * * * *', async () => {
  await emailSyncJob.syncAllConnections();
});
```

## 6. API Endpoints

- `GET /api/admin/emails/outlook/authorize` - Lấy authorization URL
- `GET /api/admin/emails/outlook/oauth/callback` - OAuth callback
- `GET /api/admin/emails/outlook/connections` - Danh sách connections
- `POST /api/admin/emails/outlook/sync` - Đồng bộ email cho một connection
- `GET /api/admin/emails/outlook/synced` - Danh sách email đã đồng bộ
- `GET /api/admin/emails/outlook/synced/:id` - Chi tiết email
- `POST /api/admin/emails/outlook/send` - Gửi email
- `PATCH /api/admin/emails/outlook/synced/:id/read` - Đánh dấu đã đọc
- `DELETE /api/admin/emails/outlook/connections/:id` - Xóa connection
- `PATCH /api/admin/emails/outlook/connections/:id/toggle-sync` - Bật/tắt đồng bộ

## Lưu ý

- Access token có thời hạn, hệ thống sẽ tự động refresh khi cần
- Email được lưu vào bảng `synced_emails` để truy vấn nhanh
- Có thể filter và search email đã đồng bộ
- Hỗ trợ gửi email qua Outlook API

