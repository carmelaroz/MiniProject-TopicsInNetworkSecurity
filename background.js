function isSuspiciousUrl(url) {
  const suspiciousPatterns = [
    /@@/,  // Matches `@@` often seen in phishing URLs
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,  // IP address in URL, not typical for legitimate sites
    /\.(tk|ml|ga|cf|gq|xyz|club|top|icu|work|info|phish)$/,  // Suspicious TLDs commonly used in phishing
    /(malware|phishing|scam|ransomware)/i,  // Keywords indicating malicious intent
  ];

  const urlObj = new URL(url);

  const maxSubdomains = 20;
  const domainParts = urlObj.hostname.split('.'); 
  const slashCount = (url.match(/\//g) || []).length;

  // Check if the URL uses an IP address instead of a domain
  const ipRegex = /^(http|https):\/\/(\d{1,3}\.){3}\d{1,3}/;
  if (ipRegex.test(url)) {
    return true;
  }

  if (domainParts.length > maxSubdomains) {
    console.log("URL has too many subdomains.");
    return true;  
  }

  if (slashCount > 20) {
    console.log("URL has too many slashes.");
    return true;  
  }

  for (let pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      console.log("URL matches suspicious pattern:", pattern);
      return true;  
    }
  }

  // Check for common URL shorteners
  const shorteners = ['bit.ly', 't.co', 'goo.gl', 'tinyurl.com', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly', 'bit.do'];
  if (shorteners.includes(urlObj.hostname)) {
    console.log("URL uses a common shortener:", urlObj.hostname);
    return true;
  }

    // Check for known phishing patterns in the hostname
    const phishingKeywordsInHostName = ['rex', 'phish', 'secure', 'login', 'update', 'verify', 'test'];
    if (phishingKeywordsInHostName.some(keyword => urlObj.hostname.includes(keyword))) {
      return true;
    }

      // Check for known phishing keywords in the full URL
  const phishingKeywordsInURL = ['rex', 'phish', 'secure', 'update', 'evil', 'verify', 'test', 'eicar'];
  for (let keyword of phishingKeywordsInURL) {
    if (url.toLowerCase().includes(keyword)) {
      console.log(`Suspicious: URL contains phishing keyword (${keyword}) - ${url}`);
      return true;
    }
  }

  return false;  
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanLink') {
    console.log('Received request to scan link:', request.url);
    const isMalicious = isSuspiciousUrl(request.url);
    sendResponse({ malicious: isMalicious });
    return true;
  }
});

function urlSafeBase64Encode(url) {
  return btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scanLinksWithVirusTotal') {
    const apiKey = '664f26ac747095f284831a287dcaeea9fa07fa26165f4a2290e121d142991638';
    const virusTotalUrl = 'https://www.virustotal.com/api/v3/urls';

    // VirusTotal requires the URL to be base64 encoded
    const url = message.url;
    const base64Url = urlSafeBase64Encode(url);

    const headers = new Headers({
      "Accept": "application/json",
      "x-apikey": apiKey,
      "Content-Type": "application/x-www-form-urlencoded"
    });

    fetch(`${virusTotalUrl}/${base64Url}`, {
      method: 'GET',  // Use GET for URL lookups
      headers: headers,
    })
    .then(response => response.json())
    .then(data => {
      // Error handling for VirusTotal API response
      if (data.error) {
        // console.error("VirusTotal API Error:", data.error.message);

        if (data.error.code === 'QuotaExceeded') {
          console.log('VirusTotal API quota exceeded.');
        }
        sendResponse({ malicious: false });
        return;
      }

      // Check if data, attributes, and last_analysis_stats exist safely
      if (!data?.data?.attributes?.last_analysis_stats) {
        console.error("Invalid VirusTotal API response format", data);
        sendResponse({ malicious: false });
        return;
      }

      // Determine if the URL is flagged as malicious by VirusTotal
      const isMalicious = data.data.attributes.last_analysis_stats.malicious > 0;
      console.log("VirusTotal scan result:", isMalicious);

      sendResponse({ malicious: isMalicious });
    })
    .catch((error) => {
      console.error('Error with VirusTotal API request:', error);
      sendResponse({ malicious: false });
    });

    // Return true to indicate asynchronous response
    return true;
  }
});