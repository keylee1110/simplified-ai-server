# Hướng dẫn sử dụng API cho Frontend

Tài liệu này cung cấp hướng dẫn cho các nhà phát triển frontend về cách tương tác với API của server.

## 1. Base URL

*   **Khi chạy cục bộ:** `http://localhost:4000` (hoặc cổng bạn đã cấu hình)
*   **Khi triển khai:** `https://simplified-ai-server.onrender.com`

Tất cả các request API sẽ được gửi đến Base URL này.

## 2. Các Endpoint API

### 2.1. Lấy câu trích dẫn động lực hàng ngày

*   **Endpoint:** `/quote-of-the-day`
*   **Method:** `GET`
*   **Mô tả:** Trả về một câu trích dẫn động lực chính và một câu nói vui theo phong cách Gen Z liên quan.
*   **Request:**
    ```
    GET https://simplified-ai-server.onrender.com/quote-of-the-day
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

### 2.2. Lấy gợi ý Portfolio

*   **Endpoint:** `/portfolio-suggestions`
*   **Method:** `POST`
*   **Mô tả:** Dựa trên thông tin người dùng cung cấp, AI sẽ đề xuất bố cục, chủ đề màu, font chữ, bio cá nhân và các gợi ý mạng xã hội cho portfolio.
*   **Authentication:**
    Nếu bạn đã cấu hình `API_KEY` trên dịch vụ hosting, bạn phải gửi khóa này trong header `x-api-key`.
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

## 3. CORS (Cross-Origin Resource Sharing)

Server đã được cấu hình để cho phép CORS, nghĩa là frontend chạy trên một domain khác vẫn có thể gọi API này.

---

**Lưu ý:**
*   Đảm bảo rằng `GEMINI_API_KEY` của bạn được bảo mật và không được đưa trực tiếp vào mã nguồn frontend.
*   Khi gọi API từ frontend, hãy thay thế `YOUR_DEPLOYED_BASE_URL` bằng URL thực tế của server đã triển khai của bạn.
*   Đối với endpoint `/portfolio-suggestions`, nếu bạn sử dụng `API_KEY`, hãy đảm bảo rằng khóa này được quản lý an toàn và không bị lộ ra ngoài.
