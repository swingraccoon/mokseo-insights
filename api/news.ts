import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  try {
    const url = 'https://coinness.com/news';
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const news: any[] = [];
    
    // 1. 테스트용 뉴스 (이게 뜨면 API 연결은 성공한 겁니다!)
    news.push({
      title: "[진단용] 비트코인 실시간 연결 테스트 뉴스입니다.",
      timestamp: "지금",
      url: "https://coinness.com"
    });

    // 2. 코인니스 제목 태그 샅샅이 뒤지기 (h3뿐만 아니라 div도 탐색)
    $('h3, div[class*="title"], div[class*="NewsList_title"]').each((_, el) => {
      const title = $(el).text().trim();
      const link = $(el).closest('a').attr('href');
      
      if (title && title.length > 10 && !title.includes("Coinness")) {
        news.push({
          title: title,
          timestamp: "최신 속보",
          url: link ? `https://coinness.com${link}` : url
        });
      }
    });

    res.status(200).json({ news });

  } catch (error) {
    res.status(200).json({ 
      news: [{ title: "서버 연결 오류 발생", timestamp: "Error", url: "#" }] 
    });
  }
}
