import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  try {
    const url = 'https://coinness.com/news';
    
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000 
    });

    const $ = cheerio.load(data);
    const news: any[] = [];

    // 코인니스의 뉴스 제목은 보통 h3 태그에 들어있습니다.
    // 클래스 이름이 수시로 바뀌어도 h3는 잘 안 바뀌기 때문에 h3를 직접 공략합니다.
    $('h3').each((_, el) => {
      const title = $(el).text().trim();
      const link = $(el).closest('a').attr('href');
      
      // 시간 정보를 찾기 위해 제목 주변의 텍스트를 탐색합니다.
      const timeStr = $(el).parent().find('span').first().text().trim() || "최신";

      if (title && title.length > 5) { // 너무 짧은 광고성 문구 제외
        news.push({
          title,
          timestamp: timeStr,
          url: link ? `https://coinness.com${link}` : 'https://coinness.com/news'
        });
      }
    });

    // 만약 코인니스에서 실패했다면 예비용으로 구글 뉴스에서 코인니스 소식만 긁어옵니다. (보험)
    if (news.length === 0) {
      const fallback = await axios.get('https://news.google.com/rss/search?q=coinness&hl=ko&gl=KR&ceid=KR:ko');
      const $rss = cheerio.load(fallback.data, { xmlMode: true });
      $rss('item').each((_, el) => {
        news.push({
          title: $rss(el).find('title').text().replace(" - 코인니스", ""),
          timestamp: "실시간",
          url: $rss(el).find('link').text()
        });
      });
    }

    res.status(200).json({ news: news.slice(0, 30) });

  } catch (error) {
    res.status(500).json({ news: [], error: "데이터 연결 실패" });
  }
}
