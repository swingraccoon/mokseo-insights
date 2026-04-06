import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  try {
    const { data } = await axios.get('https://coinness.com/news', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const news: any[] = [];

    // 코인니스 속보 리스트의 제목과 시간을 추출하는 로직
    $('div[class*="NewsList_news_item"]').each((_, el) => {
      const title = $(el).find('h3').text().trim();
      const time = $(el).find('span[class*="NewsList_time"]').text().trim();
      const link = "https://coinness.com" + $(el).find('a').attr('href');
      
      if (title) news.push({ title, timestamp: time || "방금 전", url: link });
    });

    res.status(200).json({ news: news.slice(0, 20) });
  } catch (error) {
    res.status(500).json({ news: [], error: "데이터를 가져오지 못했습니다." });
  }
}
