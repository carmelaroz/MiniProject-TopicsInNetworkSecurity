function isSuspiciousUrl(url) {
  const suspiciousPatterns = [
    /^http:\/\//,              // Links starting with http 
    /@@/,                   
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP address in URL
    /%[0-9a-fA-F]{2}/,        // Encoded characters (e.g., %20) might be used to obfuscate
    /\.tk|\.ml|\.ga|\.cf|\.gq/, // Suspicious TLDs often used by malicious sites
    /malware/,
    /test/, 
    /phishing/, 
    /scam/,  
    /ransomware/
  ];

  const maxUrlLength = 2000;
  const maxSubdomains = 20;
  const slashCount = (url.match(/\//g) || []).length;

  if (url.length > maxUrlLength) {
    console.log("URL length exceeds threshold.");
    return true;  
  }

  if (slashCount > maxSubdomains) {
    console.log("URL has too many slashes.");
    return true;  
  }

  for (let pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      console.log("URL matches suspicious pattern:", pattern);
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