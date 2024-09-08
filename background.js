chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed: Gmail Link Scanner");
  });


// // background.js
// const checkPhishingDatabase = async (url) => {
//     // Mock phishing database for now (you can integrate real API)
//     const phishingUrls = ["http://malicious-site.com", "http://phishing-site.com", "https://us05web.zoom.us/s/9895255571"];
//     return phishingUrls.includes(url);
//   };

// //   const phishingURLs = ["http://malicious-site.com", "http://phishing-site.com", "https://us05web.zoom.us/s/9895255571"];
  
//   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === 'checkLinks') {
//       const suspiciousLinks = message.links.filter(link => checkPhishingDatabase(link.href));
      
//       if (suspiciousLinks.length > 0) {
//         chrome.tabs.sendMessage(sender.tab.id, { action: 'alertUser', suspiciousLinks });
//       }
//     }
//   });