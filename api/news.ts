import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  const { q } = req.query; // 프론트에서 보낸 검색어 (예: 아서 헤이즈)
  const searchTerm = q && q !== 'ALL' && q !== 'BOOKMARKS' ? q : '';

  try {
    let url = 'https://coinness.com/news';
    let news: any[] = [];

    if (searchTerm) {
      // 1. 특정 키워드 검색 시: 구글 뉴스 RSS를 통해 코인니스 및 주요 매체 실시간 검색
      const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchTerm + " 코인")}&hl=ko&gl=KR&ceid=KR:ko`;
      const { data } = await axios.get(searchUrl);
      const $rss = cheerio.load(data, { xmlMode: true });

      $rss('item').each((_, el) => {
        news.push({
          title: $rss(el).find('title').text().replace(/ - .*/, ""), // 매체명 제거
          timestamp: "검색 결과",
          url: $rss(el).find('link').text()
        });
      });
    } else {
      // 2. '전체' 탭일 시: 코인니스 최신 속보 크롤링
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const $ = cheerio.load(data);
      $('h3').each((_, el) => {
        const title = $(el).text().trim();
        const link = $(el).closest('a').attr('href');
        if (title && title.length > 5) {
          news.push({
            title,
            timestamp: "최신 속보",
            url: link ? "https://coinness.com" + link : url
          });
        }
      });
    }

    res.status(200).json({ news: news.slice(0, 20) });
  } catch (error) {
    res.status(500).json({ news: [], error: "데이터 로드 실패" });
  }
}
