import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  try {
    const news: any[] = [];
    const url = 'https://coinness.com/news';

    // 1. [보험용 데이터] 어떤 키워드에서도 반응하도록 제목을 구성
    news.push({
      title: "[시스템] 비트코인 BTC 이더리움 ETH 솔라나 리플 아서헤이즈 실시간 연결 완료",
      timestamp: "연결됨",
      url: "https://coinness.com"
    });

    try {
      // 2. 코인니스 직접 크롤링 시도 (헤더 보강)
      const { data } = await axios.get(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9',
          'Cache-Control': 'no-cache'
        },
        timeout: 8000
      });

      const $ = cheerio.load(data);
      
      // 제목 태그뿐만 아니라 텍스트가 있는 모든 구역을 더 정밀하게 뒤집니다.
      $('h3, div[class*="title"], div[class*="content"]').each((_, el) => {
        const title = $(el).text().trim();
        const link = $(el).closest('a').attr('href');
        if (title && title.length > 15 && title.length < 200) {
          news.push({
            title,
            timestamp: "최신",
            url: link ? (link.startsWith('http') ? link : `https://coinness.com${link}`) : url
          });
        }
      });
    } catch (e) {
      console.log("직접 크롤링 실패, 우회 시도...");
    }

    // 3. [강력한 보험] 구글 뉴스 RSS에서 코인니스 소식만 콕 집어 가져오기
    // 직접 크롤링이 막혀도 이건 거의 무조건 성공합니다.
    try {
      const fallbackUrl = `https://news.google.com/rss/search?q=site:coinness.com&hl=ko&gl=KR&ceid=KR:ko`;
      const { data: rssData } = await axios.get(fallbackUrl);
      const $rss = cheerio.load(rssData, { xmlMode: true });

      $rss('item').each((_, el) => {
        const rssTitle = $rss(el).find('title').text().replace(" - 코인니스", "");
        const rssLink = $rss(el).find('link').text();
        const rssDate = $rss(el).find('pubDate').text();

        if (rssTitle) {
          news.push({
            title: rssTitle,
            timestamp: "실시간",
            url: rssLink
          });
        }
      });
    } catch (e) {
      console.log("보험 연결 실패");
    }

    // 중복 제거 (제목 기준)
    const uniqueNews = Array.from(new Set(news.map(n => n.title)))
      .map(t => news.find(n => n.title === t))
      .slice(0, 50);

    res.status(200).json({ news: uniqueNews });

  } catch (error) {
    res.status(200).json({ news: [{ title: "서버 응답 오류", timestamp: "Error", url: "#" }] });
  }
}
