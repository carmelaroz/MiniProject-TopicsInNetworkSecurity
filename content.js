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