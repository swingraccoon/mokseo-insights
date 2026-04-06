import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  try {
    // 오직 코인니스 메인 뉴스 페이지만 타겟팅합니다.
    const url = 'https://coinness.com/news';
    
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 10000 
    });

    const $ = cheerio.load(data);
    const news: any[] = [];

    // 코인니스 속보 아이템들을 정밀하게 타겟팅합니다.
    // 보통 h3 태그에 제목이 들어있고, 그 부모 요소에 링크가 있습니다.
    $('h3').each((_, el) => {
      const title = $(el).text().trim();
      // 가장 가까운 링크(a) 태그를 찾습니다.
      const linkWrap = $(el).closest('a');
      const href = linkWrap.attr('href');
      
      // 시간 정보 추출 (h3 주변의 span이나 div에서 시간을 찾음)
      const timeTag = $(el).parent().find('span').first().text().trim() || "속보";
      
      if (title && title.length > 5) {
        news.push({
          title: title,
          timestamp: timeTag,
          url: href ? `https://coinness.com${href}` : 'https://coinness.com/news'
        });
      }
    });

    // 중복 제거 및 최신순 정렬 (최대 30개)
    const uniqueNews = Array.from(new Set(news.map(a => a.url)))
      .map(url => news.find(a => a.url === url))
      .slice(0, 30);

    res.status(200).json({ news: uniqueNews });

  } catch (error) {
    console.error("코인니스 로드 에러:", error);
    res.status(500).json({ news: [], error: "코인니스 데이터를 가져오지 못했습니다." });
  }
}
