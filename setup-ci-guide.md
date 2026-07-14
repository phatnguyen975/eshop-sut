# Hướng dẫn thiết lập CI với GitHub Actions cho EShop SUT

Tài liệu này hướng dẫn cách cấu hình GitHub Repository để chạy tự động các bộ test Playwright (Smoke & Regression) mà chúng ta đã thiết lập.

## 1. Kiến trúc CI Monorepo

Vì đây là một monorepo chứa cả Backend, Frontend-Web, và Frontend-Admin, CI đã được thiết kế thông minh (Smart CI) sử dụng `dorny/paths-filter`:

- Nếu bạn sửa code ở `frontend-web/`, CI sẽ chỉ chạy test cho Web.
- Nếu bạn sửa code ở `frontend-admin/`, CI sẽ chỉ chạy test cho Admin.
- Nếu bạn sửa `backend/` hoặc `e2e/`, CI sẽ chạy toàn bộ.

Điều này giúp tiết kiệm thời gian CI (CI minutes) và tránh phải chờ đợi bài test của admin chạy khi bạn chỉ vừa sửa một nút bấm bên web.

## 2. Các bước Setup trên GitHub

Để CI hoạt động, GitHub cần biết các biến môi trường (URL) và bí mật (Mật khẩu) để truy cập hệ thống của bạn.

**Bước 1:** Truy cập vào Repository của bạn trên GitHub.
**Bước 2:** Chuyển sang tab **Settings** > **Secrets and variables** > **Actions**.
**Bước 3:** Thêm các giá trị sau:

### Variables

Chuyển sang tab **Variables**, nhấn **New repository variable**:

| Name             | Value (Ví dụ)                        | Ý nghĩa                                                            |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------ |
| `WEB_BASE_URL`   | `https://eshop-web.yourdomain.com`   | URL thực tế của frontend-web đã deploy                             |
| `API_BASE_URL`   | `https://eshop-api.yourdomain.com`   | URL thực tế của backend đã deploy                                  |
| `ADMIN_BASE_URL` | `https://eshop-admin.yourdomain.com` | URL thực tế của admin (Tạm thời điền gì cũng được nếu chưa deploy) |

### Secrets

Chuyển sang tab **Secrets**, nhấn **New repository secret**:

| Name             | Value             | Ý nghĩa                                |
| ---------------- | ----------------- | -------------------------------------- |
| `USER_EMAIL`     | `test@eshop.com`  | Email của user đã tạo sẵn trong DB SUT |
| `USER_PASSWORD`  | `Test1234!`       | Mật khẩu của user                      |
| `ADMIN_EMAIL`    | `admin@eshop.com` | Email của admin                        |
| `ADMIN_PASSWORD` | `Admin123!`       | Mật khẩu của admin                     |

## 3. Kích hoạt và Kiểm thử CI

Sau khi cấu hình xong Variables và Secrets, bạn chỉ cần commit code lên nhánh `web-automation-testing`:

```bash
git add .github/workflows/ e2e/playwright.config.ts setup-ci-guide.md
git commit -m "ci: setup monorepo smart ci for web and admin"
git push origin web-automation-testing
```

- Vào tab **Actions** trên GitHub.
- Bạn sẽ thấy workflow **Smoke Tests (Monorepo)** và **Regression Tests (Monorepo)** được kích hoạt.
- Click vào workflow đang chạy, bạn sẽ thấy nó tự động phát hiện bạn vừa thay đổi các file trong `e2e/`, từ đó kích hoạt cờ chạy cho cả Web và API!
