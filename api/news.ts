import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  try {
    const url = 'https://coinness.com/news';
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const news: any[] = [];
    
    // 1. 날짜 헤더 찾기
    let dateHeader = $('div[class*="date_header"]').first().text().trim() || "최근";
    dateHeader = dateHeader.replace("오늘, ", "");

    // 2. 제목(h3)을 기준으로 더 넓게 긁어옵니다.
    $('h3').each((_, el) => {
      const title = $(el).text().trim();
      const link = $(el).closest('a').attr('href');
      const time = $(el).closest('div').find('span[class*="time"]').first().text().trim() || "속보";
      
      if (title && title.length > 5) {
        news.push({
          title: title,
          timestamp: `${dateHeader} ${time}`,
          url: link ? (link.startsWith('http') ? link : `https://coinness.com${link}`) : url
        });
      }
    });

    // 3. 만약 뉴스가 0개라면? (연결은 됐는데 긁어오기 실패한 경우)
    if (news.length === 0) {
      return res.status(200).json({ 
        news: [
          { title: "[연결 성공] 하지만 코인니스에서 뉴스를 찾지 못했습니다. 구조가 바뀐 것 같아요.", timestamp: "System", url: "#" },
          { title: "비트코인, 이더리움 등 키워드 필터를 풀고 '전체 속보' 탭을 확인해보세요.", timestamp: "Guide", url: "#" }
        ] 
      });
    }

    res.status(200).json({ news: news.slice(0, 50) });

  } catch (error) {
    // 아예 서버 접속 자체가 안 된 경우
    res.status(200).json({ 
      news: [{ title: "서버 접속 실패: 코인니스 보안망에 막혔을 가능성이 큽니다.", timestamp: "Error", url: "#" }] 
    });
  }
}
