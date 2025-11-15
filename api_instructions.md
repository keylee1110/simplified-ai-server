# Hướng dẫn sử dụng API cho Frontend

Tài liệu này cung cấp hướng dẫn cho các nhà phát triển frontend về cách tương tác với API của server.

## 1. Cài đặt và Khởi động Server

Để chạy server cục bộ, bạn cần đảm bảo đã cài đặt Node.js và npm.

1.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```
2.  **Tạo file `.env`:**
    Tạo một file có tên `.env` ở thư mục gốc của project và thêm các biến môi trường sau:
    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    GEMINI_MODEL=gemini-2.5-flash
    PORT=4000
    API_KEY=YOUR_SECRET_API_KEY_FOR_PORTFOLIO_SUGGESTIONS
    ```
    *   Thay thế `YOUR_GEMINI_API_KEY` bằng khóa API của bạn từ Google Gemini.
    *   `GEMINI_MODEL` có thể là `gemini-2.5-flash` hoặc các model khác bạn muốn sử dụng.
    *   `PORT` là cổng mà server sẽ chạy (mặc định là 4000).
    *   `API_KEY` là một khóa bí mật tùy chọn để bảo vệ endpoint `/portfolio-suggestions`. Nếu bạn không muốn sử dụng bảo mật này, bạn có thể bỏ qua dòng `API_KEY` trong file `.env` và server sẽ không yêu cầu `x-api-key` cho endpoint đó.
3.  **Khởi động server:**
    ```bash
    node index.js
    ```
    Server sẽ chạy trên `http://localhost:PORT` (ví dụ: `http://localhost:4000`).

## 2. Base URL

Tất cả các request API sẽ được gửi đến base URL sau (khi chạy cục bộ):

`http://localhost:4000` (hoặc cổng bạn đã cấu hình)

## 3. Các Endpoint API

### 3.1. Lấy câu trích dẫn động lực hàng ngày

*   **Endpoint:** `/quote-of-the-day`
*   **Method:** `GET`
*   **Mô tả:** Trả về một câu trích dẫn động lực chính và một câu nói vui theo phong cách Gen Z liên quan.
*   **Request:**
    ```
    GET http://localhost:4000/quote-of-the-day
    ```
*   **Response (JSON):**
    ```json
    {
      "quote_main": "Mỗi ngày không cần tỏa sáng, chỉ cần đừng tắt đèn là được",
      "playful_line": "Cứ chill đi!"
    }
    ```
    Hoặc nếu có lỗi từ AI:
    ```json
    {
      "quote_main": "Mỗi ngày không cần tỏa sáng, chỉ cần đừng tắt đèn là được",
      "playful_line": "Cứ chill đi!",
      "error": "AI đang nghỉ xíu"
    }
    ```

### 3.2. Lấy gợi ý Portfolio

*   **Endpoint:** `/portfolio-suggestions`
*   **Method:** `POST`
*   **Mô tả:** Dựa trên thông tin người dùng cung cấp, AI sẽ đề xuất bố cục, chủ đề màu, font chữ, bio cá nhân và các gợi ý mạng xã hội cho portfolio.
*   **Authentication:**
    Nếu bạn đã cấu hình `API_KEY` trong file `.env`, bạn phải gửi khóa này trong header `x-api-key`.
    ```
    x-api-key: YOUR_SECRET_API_KEY_FOR_PORTFOLIO_SUGGESTIONS
    ```
*   **Request Body (JSON):**
    ```json
    {
      "userInfo": "Sinh viên năm cuối ngành Thiết kế đồ họa, muốn tạo portfolio để xin việc làm thiết kế UI/UX."
    }
    ```
    `userInfo` là một chuỗi mô tả ngắn gọn về người dùng hoặc mục đích của portfolio.
*   **Response (JSON):**
    ```json
    {
      "palette": [1],
      "fonts": ["Roboto", "Open Sans"],
      "layout": {
        "number": 2,
        "name": "Header Chuyên nghiệp",
        "explanation": "Phù hợp với sinh viên muốn thể hiện sự chuyên nghiệp, trang trọng khi ứng tuyển vào các vị trí thiết kế UI/UX."
      },
      "bio": "Sinh viên thiết kế đồ họa với niềm đam mê tạo ra trải nghiệm người dùng trực quan và đẹp mắt. Sẵn sàng biến ý tưởng thành hiện thực.",
      "social_suggestions": ["LinkedIn", "Behance", "Dribbble"],
      "allColorThemes": [
        { "number": 1, "name": "Hồng Phấn Cổ điển", "description": "..." },
        { "number": 2, "name": "Xanh Bạc hà", "description": "..." }
        // ... các chủ đề màu khác
      ],
      "allLayouts": [
        { "number": 1, "name": "Thẻ Cổ điển", "description": "..." },
        { "number": 2, "name": "Header Chuyên nghiệp", "description": "..." }
        // ... các layout khác
      ]
    }
    ```

## 4. CORS (Cross-Origin Resource Sharing)

Server đã được cấu hình để cho phép CORS, nghĩa là frontend chạy trên một domain khác vẫn có thể gọi API này.

---

**Lưu ý:**
*   Đảm bảo rằng `GEMINI_API_KEY` của bạn được bảo mật và không được đưa trực tiếp vào mã nguồn frontend.
*   Nếu bạn triển khai server lên môi trường production, hãy thay đổi `http://localhost:4000` bằng URL của server đã triển khai.
*   Đối với endpoint `/portfolio-suggestions`, nếu bạn sử dụng `API_KEY`, hãy đảm bảo rằng khóa này được quản lý an toàn và không bị lộ ra ngoài.
