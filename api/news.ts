import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: any, res: any) {
  try {
    const url = 'https://coinness.com/news';
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const news: any[] = [];
    
    // 1. 날짜 헤더 찾기 (더 넓은 범위로 찾음)
    let dateHeader = $('div[class*="date_header"]').first().text().trim() || "오늘";
    dateHeader = dateHeader.replace("오늘, ", "");

    // 2. 뉴스 아이템 찾기 (클래스 이름이 바뀌어도 찾을 수 있게 더 유연하게 설정)
    $('div[class*="news_item"], div[class*="NewsList_news_item"]').each((_, el) => {
      const title = $(el).find('h3').text().trim();
      const time = $(el).find('span[class*="time"]').first().text().trim();
      const link = $(el).find('a').attr('href');
      
      if (title && title.length > 5) {
        news.push({
          title: title,
          timestamp: `${dateHeader} ${time}`,
          url: link ? `https://coinness.com${link}` : url
        });
      }
    });

    // 3. 보험(Fallback): 만약 크롤링 실패로 뉴스 개수가 0개라면 예시 데이터라도 보냅니다.
    if (news.length === 0) {
      return res.status(200).json({ 
        news: [
          { title: "[연결 확인] 실시간 뉴스를 가져오는 중입니다. 잠시만 기다려주세요.", timestamp: "방금 전", url: "#" },
          { title: "데이터 연결이 지연될 경우 새로고침 버튼을 눌러주세요.", timestamp: "안내", url: "#" }
        ] 
      });
    }

    res.status(200).json({ news: news.slice(0, 50) });

  } catch (error) {
    res.status(200).json({ 
      news: [{ title: "서버 연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", timestamp: "에러", url: "#" }] 
    });
  }
}
