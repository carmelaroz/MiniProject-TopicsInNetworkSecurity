const suspiciousLink = "https://us05web.zoom.us/s/9895255571";
let currentURL = window.location.href;

// Function to scan for suspicious links
function scanLinks(messageBody) {
  if (messageBody) {
    console.log("Message body detected. Scanning for links...");
    const links = messageBody.querySelectorAll('a');
    
    links.forEach(link => {
      if (link.href === suspiciousLink) {
        alert("Suspicious link detected: " + link.href);
      }
    });
    console.log("scanning completed.");
  } else {
    console.log("No message body found.");
  }
}

// Function to find the message container dynamically
function findMessageContainer() {
  let messageBody = document.querySelector('div[role="listitem"], div.ii.gt, div[role="tabpanel"], div.a3s.aXjCH');
  
  if (messageBody) {
    scanLinks(messageBody);  // If message body found, scan it for links
  } else {
    console.log("No message container found yet. Retrying...");
  }
}

// Start observing for URL changes (i.e., when navigating between Gmail messages)
function observeURLChanges() {
  setInterval(() => {
    if (window.location.href !== currentURL) {
      console.log("URL changed, detecting new message...");
      currentURL = window.location.href;
      findMessageContainer();  // When URL changes, attempt to scan the new message
    }
  }, 1000);  // Check for URL changes every second
}

// Start observing for DOM changes (message content loaded)
function startObservingMessages() {
  const messageContainer = document.querySelector('div[role="main"]');

  if (messageContainer) {
    console.log('Started observing Gmail message container for changes...');
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          console.log('Email content changed. Scanning for suspicious links...');
          findMessageContainer();  // Trigger scanning process when new email is loaded
        }
      });
    });

    observer.observe(messageContainer, { childList: true, subtree: true });
  } else {
    console.log('Main message container not found. Retrying in 500ms...');
    setTimeout(startObservingMessages, 500);  // Retry every 500ms if container not found
  }
}

// Begin observing Gmail when the extension is loaded
startObservingMessages();
observeURLChanges();  // Also observe for navigation between messages




// // content.js
// const extractLinks = () => {
//     const links = Array.from(document.querySelector('a'));
//     const emailLinks = links.map(link => ({
//       href: link.href,
//       text: link.textContent
//     }));
    
//     // Send links to background script for scanning
//     chrome.runtime.sendMessage({ action: 'checkLinks', links: emailLinks });
//   };


// // Function to extract and scan links from the opened email
// const extractAndScanLinks = () => {
//     // Select the part of the DOM where Gmail renders the email content
//     const emailContent = document.querySelector('div[role="listitem"] div[role="list"]');
  
//     if (emailContent) {
//       const links = Array.from(emailContent.querySelector('a'));
//       const emailLinks = links.map(link => ({
//         href: link.href,
//         text: link.textContent
//       }));

//       console.log(emailLinks);
  
//       // Send links to the background script for scanning
//       chrome.runtime.sendMessage({ action: 'checkLinks', links: emailLinks });
//     }
//   };
  
// // Set up MutationObserver to detect when the email content changes
// const observeEmailContainer = () => {
//     const emailContainer = document.querySelector('div[role="main"]');
    
//     if (!emailContainer) return;
  
//     // Observer function to detect changes in the Gmail email list and email viewer
//     const observer = new MutationObserver((mutations) => {
//       mutations.forEach((mutation) => {
//         if (mutation.addedNodes.length > 0) {
//           // Check if the mutation contains an email content element
//           const emailContent = mutation.target.querySelector('div[role="listitem"] div[role="list"]');
//           if (emailContent) {
//             // Trigger link extraction and scanning when email is opened
//             extractAndScanLinks();
//             console.log("blabla")
//           }
//         }
//       });
//     });
  
//     // Start observing changes in Gmail's main content area (where emails are shown)
//     observer.observe(emailContainer, {
//       childList: true,  // Observe direct child changes
//       subtree: true     // Observe changes to all descendants
//     });
//   };
  
//   // Run the observer once the page is loaded
//   window.addEventListener('load', observeEmailContainer);


//   chrome.runtime.onMessage.addListener((message) => {
//     if (message.action === 'alertUser') {
//       const suspiciousLinks = message.suspiciousLinks;
//       suspiciousLinks.forEach(link => {
//         alert(`Warning: The link "${link.text}" is potentially dangerous!`);
//       });
//     }
//   });