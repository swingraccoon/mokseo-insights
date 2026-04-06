import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  const { q } = req.query; // 사용자가 클릭한 탭 이름 (예: 아서헤이즈)
  const searchTerm = q && q !== 'ALL' && q !== 'BOOKMARKS' ? q : '';

  try {
    let news: any[] = [];

    if (searchTerm) {
      // 탭이 키워드일 때: 코인니스 사이트 내에서 해당 키워드만 정밀 검색 (구글 RSS 기술 활용)
      // site:coinness.com 옵션을 붙여 오직 코인니스 뉴스만 가져옵니다.
      const searchUrl = `https://news.google.com/rss/search?q=site:coinness.com+${encodeURIComponent(searchTerm)}&hl=ko&gl=KR&ceid=KR:ko`;
      const { data } = await axios.get(searchUrl);
      const $rss = cheerio.load(data, { xmlMode: true });

      $rss('item').each((_, el) => {
        const title = $rss(el).find('title').text();
        // ' - 코인니스' 등 매체 표기 부분을 깔끔하게 제거합니다.
        const cleanTitle = title.split(' - ')[0];
        const link = $rss(el).find('link').text();
        
        news.push({
          title: cleanTitle,
          timestamp: "검색 결과",
          url: link
        });
      });
    } else {
      // '전체' 탭일 때: 기존처럼 코인니스 최신 속보를 긁어옵니다.
      const { data } = await axios.get('https://coinness.com/news', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const $ = cheerio.load(data);
      $('h3').each((_, el) => {
        const title = $(el).text().trim();
        const link = $(el).closest('a').attr('href');
        if (title && title.length > 5) {
          news.push({
            title,
            timestamp: "최신 속보",
            url: link ? `https://coinness.com${link}` : 'https://coinness.com/news'
          });
        }
      });
    }

    res.status(200).json({ news: news.slice(0, 20) });
  } catch (error) {
    res.status(500).json({ news: [], error: "데이터 로드 실패" });
  }
}
