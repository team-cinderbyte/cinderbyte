import axios, { AxiosHeaders } from "axios";

export default async function extractKwikVideo(
  url: string,
  { baseUrl, headers }: { baseUrl: string; headers: AxiosHeaders },
) {
  try {
    const response = await axios.get(url, {
      headers,
    });

    const html = await response.data;
    const scriptMatch = /(eval)(\(f.*?)(\n<\/script>)/s.exec(html);

    if (!scriptMatch) {
      return {
        error: true,
        message: "Could not find obfuscated script",
        originalUrl: url,
      };
    }

    const evalCode = scriptMatch[2]?.replace("eval", "");
    const deobfuscated = eval(evalCode as string);
    const m3u8Match = deobfuscated.match(/https.*?m3u8/);

    if (m3u8Match && m3u8Match[0]) {
      return {
        error: false,
        url: m3u8Match[0],
        isM3U8: true,
        originalUrl: url,
      };
    }

    return {
      error: true,
      message: "Could not extract m3u8 URL",
      originalUrl: url,
    };
  } catch (error: any) {
    console.error("Error extracting Kwik video:", error);
    return {
      error: true,
      message: error.message,
      originalUrl: url,
    };
  }
}

export function organizeStreamLinks(links: any) {
  const result = { sub: [], dub: [] };
  const qualityOrder = ["1080p", "720p", "360p"];

  for (const link of links) {
    const isDub = link.isDub;
    const targetList = isDub ? result.dub : result.sub;
    targetList.push(link.url as never);
  }

  // Sort by quality
  const sortByQuality = (a: any, b: any) => {
    const qualityA = qualityOrder.indexOf(a.match(/\d+p/)?.[0] || "");
    const qualityB = qualityOrder.indexOf(b.match(/\d+p/)?.[0] || "");
    return qualityB - qualityA;
  };

  result.sub.sort(sortByQuality);
  result.dub.sort(sortByQuality);

  return result;
}
