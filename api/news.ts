import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  try {
    const url = 'https://coinness.com/news';
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const news: any[] = [];
    
    // 현재 날짜 구하기 (코인니스 상단 날짜 기준)
    const dateHeader = $('div[class*="NewsList_date_header"]').first().text().trim() || "오늘";

    // 코인니스 속보 아이템 하나하나를 정밀하게 훑습니다.
    $('div[class*="NewsList_news_item"]').each((_, el) => {
      const title = $(el).find('h3').text().trim();
      const time = $(el).find('span[class*="NewsList_time"]').text().trim(); // 예: 17:18
      const link = $(el).find('a').attr('href');
      
      // 날짜와 시간을 합쳐서 '4월 6일 17:18' 형식으로 만듭니다.
      const fullTimestamp = dateHeader.replace("오늘, ", "") + " " + time;

      if (title && title.length > 5) {
        news.push({
          title: title,
          timestamp: fullTimestamp.trim(),
          url: link ? `https://coinness.com${link}` : url
        });
      }
    });

    res.status(200).json({ news: news.slice(0, 40) }); // 최신 속보 40개 전달

  } catch (error) {
    res.status(500).json({ news: [], error: "코인니스 연결 실패" });
  }
}
