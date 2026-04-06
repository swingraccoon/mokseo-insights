import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  try {
    const url = 'https://coinness.com/news';
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const news: any[] = [];
    
    // 1. 현재 페이지의 날짜 헤더 찾기 (예: 오늘, 2026년 4월 6일 월요일)
    const dateHeader = $('div[class*="NewsList_date_header"]').first().text().trim();
    // '오늘, ' 글자를 지우고 날짜만 남깁니다.
    const pureDate = dateHeader.replace("오늘, ", "").split("요일")[0] + "요일";

    // 2. 속보 아이템 리스트 훑기
    $('div[class*="NewsList_news_item"]').each((_, el) => {
      const title = $(el).find('h3').text().trim();
      const time = $(el).find('span[class*="NewsList_time"]').text().trim(); // 예: 17:15
      const link = $(el).find('a').attr('href');
      
      // 날짜와 시간을 합쳐서 표시 (예: 2026년 4월 6일 월요일 17:15)
      const fullTimestamp = `${pureDate} ${time}`;

      if (title && title.length > 5) {
        news.push({
          title: title,
          timestamp: fullTimestamp,
          url: link ? `https://coinness.com${link}` : url
        });
      }
    });

    // 최신 순으로 최대 50개까지만 전달
    res.status(200).json({ news: news.slice(0, 50) });

  } catch (error) {
    console.error("코인니스 로드 실패:", error);
    res.status(500).json({ news: [], error: "데이터를 가져오지 못했습니다." });
  }
}
