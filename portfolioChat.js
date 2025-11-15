import readline from 'readline';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_BASE_URL = 'http://localhost:4000'; // server port 4000

async function getPortfolioSuggestions(userInfo) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/portfolio-suggestions`,
      { userInfo },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.SIMPLE_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio suggestions:', error.response ? error.response.data : error.message);
    return null;
  }
}

function startChat() {
  console.log('Chào bạn! Hãy cung cấp thông tin về bản thân để nhận gợi ý thiết kế portfolio.');
  console.log('Ví dụ: "Tôi là sinh viên ngành Marketing, tính cách năng động, muốn làm portfolio cá nhân."');
  console.log('Hoặc: "Tôi là lập trình viên backend, chuyên về Node.js, thích phong cách tối giản."');

  rl.question('Thông tin của bạn: ', async (userInfo) => {
    if (!userInfo.trim()) {
      console.log('Bạn chưa nhập thông tin nào. Vui lòng thử lại.');
      return startChat();
    }

    console.log('\nĐang tạo gợi ý portfolio cho bạn...');
    const suggestions = await getPortfolioSuggestions(userInfo);

    if (suggestions) {
      console.log('\n--- Gợi ý Portfolio của bạn ---');

      const paletteNum = Array.isArray(suggestions.palette) && suggestions.palette[0]
        ? suggestions.palette[0]
        : 1;

      // Nếu server có trả danh sách, tra tên; nếu không thì in số
      let colorThemeName = `Chủ đề #${paletteNum}`;
      if (Array.isArray(suggestions.allColorThemes)) {
        const matched = suggestions.allColorThemes.find(t => String(t.number) === String(paletteNum));
        if (matched) colorThemeName = matched.name;
      }

      console.log('Màu sắc chủ đạo:', colorThemeName);
      console.log('Font chữ:', Array.isArray(suggestions.fonts) ? suggestions.fonts.join(', ') : 'Không xác định');

      if (suggestions.layout) {
        const layNo = suggestions.layout.number ?? '?';
        const layName = suggestions.layout.name ?? 'Không xác định';
        console.log('Layout: Số', layNo, '-', layName);
        console.log('Lý do chọn Layout:', suggestions.layout.explanation || '(không có)');
      } else {
        console.log('Layout: Không xác định');
      }

      console.log('Bio cá nhân:', suggestions.bio || '(không có)');
      console.log('Gợi ý Social:', Array.isArray(suggestions.social_suggestions) ? suggestions.social_suggestions.join(', ') : 'Không xác định');
      console.log('------------------------------\n');
    } else {
      console.log('Không thể tạo gợi ý portfolio. Vui lòng thử lại sau.');
    }

    rl.question('Bạn có muốn nhận thêm gợi ý không? (có/không): ', (answer) => {
      if (answer.trim().toLowerCase() === 'có') {
        startChat();
      } else {
        rl.close();
        console.log('Cảm ơn bạn đã sử dụng!');
      }
    });
  });
}

startChat();
