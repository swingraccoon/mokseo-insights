import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  try {
    // 1. 코인니스 직접 가져오기 시도
    const { data } = await axios.get('https://coinness.com/news', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 5000 // 5초 안에 안 오면 포기
    });

    const $ = cheerio.load(data);
    const news: any[] = [];

    // 코인니스 최신 클래스 이름에 맞춰서 추출 (h3 태그 위주)
    $('h3').each((_, el) => {
      const title = $(el).text().trim();
      const parentLink = $(el).closest('a').attr('href');
      const timestamp = $(el).closest('div').find('span').first().text().trim();
      
      if (title && title.length > 5) { // 너무 짧은 제목은 제외
        news.push({ 
          title, 
          timestamp: timestamp || "속보", 
          url: parentLink ? "https://coinness.com" + parentLink : "https://coinness.com/news" 
        });
      }
    });

    // 2. 만약 코인니스에서 뉴스를 하나도 못 가져왔다면? (차단되었을 때)
    if (news.length === 0) {
      throw new Error("Coinness blocked. Switching to secondary source.");
    }

    res.status(200).json({ news: news.slice(0, 15) });

  } catch (error) {
    // 3. 보험(Fallback): 구글 뉴스 RSS 활용 (코인니스 소식만 필터링)
    try {
      const googleNews = await axios.get('https://news.google.com/rss/search?q=coinness&hl=ko&gl=KR&ceid=KR:ko');
      const $rss = cheerio.load(googleNews.data, { xmlMode: true });
      const fallbackNews: any[] = [];

      $rss('item').each((_, el) => {
        fallbackNews.push({
          title: $rss(el).find('title').text().replace(" - 코인니스", ""),
          timestamp: "실시간",
          url: $rss(el).find('link').text()
        });
      });

      res.status(200).json({ news: fallbackNews.slice(0, 15) });
    } catch (fallbackError) {
      res.status(500).json({ news: [], error: "모든 데이터 소스가 응답하지 않습니다." });
    }
  }
}
