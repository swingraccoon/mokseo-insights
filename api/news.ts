import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  const { q } = req.query;
  const searchTerm = q && q !== 'ALL' && q !== 'BOOKMARKS' ? q : '';

  try {
    let news: any[] = [];

    if (searchTerm) {
      // ⭐ 핵심: 최근 7일(7d) 동안의 코인니스 뉴스를 검색하도록 요청합니다.
      const searchUrl = `https://news.google.com/rss/search?q=site:coinness.com+${encodeURIComponent(searchTerm)}+when:7d&hl=ko&gl=KR&ceid=KR:ko`;
      const { data } = await axios.get(searchUrl);
      const $rss = cheerio.load(data, { xmlMode: true });

      $rss('item').each((_, el) => {
        const title = $rss(el).find('title').text().split(' - ')[0];
        const link = $rss(el).find('link').text();
        const pubDate = $rss(el).find('pubDate').text();
        
        // 날짜를 한국인이 보기 편한 형식으로 변환
        const date = new Date(pubDate);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;

        news.push({
          title: title,
          timestamp: formattedDate,
          url: link
        });
      });
    } else {
      // [전체] 탭은 기존처럼 가장 빠른 실시간 속보를 가져옵니다.
      const { data } = await axios.get('https://coinness.com/news', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);
      $('h3').each((_, el) => {
        const title = $(el).text().trim();
        const link = $(el).closest('a').attr('href');
        if (title && title.length > 5) {
          news.push({
            title,
            timestamp: "실시간",
            url: link ? `https://coinness.com${link}` : 'https://coinness.com/news'
          });
        }
      });
    }

    res.status(200).json({ news: news.slice(0, 50) }); // 결과 개수를 50개로 늘림
  } catch (error) {
    res.status(500).json({ news: [], error: "데이터 로드 실패" });
  }
}
