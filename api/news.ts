import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  try {
    const url = 'https://coinness.com/news';
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Referer': 'https://coinness.com/',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const news: any[] = [];
    
    // 1. 오늘 날짜 정보 가져오기
    let dateHeader = $('div[class*="date_header"]').first().text().trim() || "오늘";
    dateHeader = dateHeader.replace("오늘, ", "");

    // 2. 뉴스 아이템 정밀 타겟팅
    // h3 태그(제목)를 기준으로 그 주변의 모든 정보를 수집합니다.
    $('h3').each((_, el) => {
      const title = $(el).text().trim();
      
      // 제목이 포함된 가장 가까운 링크 찾기
      const linkWrap = $(el).closest('a');
      const href = linkWrap.attr('href');
      
      // 시간 정보 찾기 (h3와 같은 레벨 혹은 부모 안에 있는 span/div 탐색)
      const time = $(el).parent().find('span').text().match(/\d{2}:\d{2}/)?.[0] || "속보";

      if (title && title.length > 5 && !title.includes("Coinness")) {
        news.push({
          title: title,
          timestamp: `${dateHeader} ${time}`,
          url: href ? (href.startsWith('http') ? href : `https://coinness.com${href}`) : url
        });
      }
    });

    // 3. 만약 여전히 0개라면 (디자인이 완전히 뒤집힌 경우)
    if (news.length === 0) {
      // 마지막 수단: 모든 div 중에서 시간 형식이 포함된 것들을 훑습니다.
      $('div').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 10 && text.length < 200 && /\d{2}:\d{2}/.test(text)) {
          // 텍스트에서 시간과 제목 분리 시도 (단순 구현)
          const timeMatch = text.match(/\d{2}:\d{2}/);
          if (timeMatch) {
            news.push({
              title: text.replace(timeMatch[0], "").trim(),
              timestamp: `${dateHeader} ${timeMatch[0]}`,
              url: url
            });
          }
        }
      });
    }

    // 중복 제거 및 결과 반환
    const uniqueNews = Array.from(new Set(news.map(n => n.title)))
      .map(title => news.find(n => n.title === title))
      .slice(0, 40);

    res.status(200).json({ news: uniqueNews });

  } catch (error) {
    res.status(200).json({ 
      news: [{ title: "네트워크 연결이 불안정합니다. 잠시 후 다시 새로고침 해주세요.", timestamp: "Error", url: "#" }] 
    });
  }
}
