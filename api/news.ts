import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  const { q } = req.query;
  const searchTerm = q && q !== 'ALL' && q !== 'BOOKMARKS' ? q : '';

  try {
    let news: any[] = [];

    if (searchTerm) {
      // 🔍 한 달(30d) 동안의 코인니스 소식을 검색합니다.
      const searchUrl = `https://news.google.com/rss/search?q=site:coinness.com+${encodeURIComponent(searchTerm)}+when:30d&hl=ko&gl=KR&ceid=KR:ko`;
      const { data } = await axios.get(searchUrl);
      const $rss = cheerio.load(data, { xmlMode: true });

      $rss('item').each((_, el) => {
        const title = $rss(el).find('title').text().split(' - ')[0];
        const link = $rss(el).find('link').text();
        const pubDate = $rss(el).find('pubDate').text();
        
        const d = new Date(pubDate);
        // 날짜 형식: 2026-04-06 17:18
        const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

        news.push({ title, timestamp: formattedDate, url: link });
      });
    } else {
      // [전체 속보] 실시간 데이터 가져오기
      const { data } = await axios.get('https://coinness.com/news', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);
      const dateHeader = $('div[class*="NewsList_date_header"]').first().text().trim().replace("오늘, ", "");

      $('div[class*="NewsList_news_item"]').each((_, el) => {
        const title = $(el).find('h3').text().trim();
        const time = $(el).find('span[class*="NewsList_time"]').text().trim();
        const link = $(el).find('a').attr('href');
        if (title) {
          news.push({
            title,
            timestamp: `${dateHeader} ${time}`,
            url: link ? `https://coinness.com${link}` : 'https://coinness.com/news'
          });
        }
      });
    }

    res.status(200).json({ news: news.slice(0, 80) }); // 한 달치이므로 개수를 80개로 넉넉히 늘림
  } catch (error) {
    res.status(500).json({ news: [], error: "데이터 로드 실패" });
  }
}
