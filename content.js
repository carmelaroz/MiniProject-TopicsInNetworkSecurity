let currentURL = window.location.href;

function getCompletedReadyState() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve('completed');
    }
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        resolve('completed');
      }
    };
  });
}


// Function to scan for suspicious links
/*async function scanLinks(messageBody) {
  if (messageBody) {
    console.log("Message body detected. Scanning for links...");

    const links = messageBody.querySelectorAll('a');
    // maliciousFound = false;  // Flag to track if we find a malicious link
    let maliciousLinks = [];  // Array to collect malicious links


    links.forEach(link => {
        console.log(`Scanning link: ${link.href}`);
  
        // Send message to background script to check link with VirusTotal
        chrome.runtime.sendMessage({ action: 'scanLink', url: link.href }, (response) => {
          if (chrome.runtime.lastError) {
              console.error("Runtime error:", chrome.runtime.lastError.message);
              showNotification("Error scanning link.", true);  // Notify user of error
              return;
          }
          if (response) {
              console.log("Response received from background script:", response);
              if (response.malicious) {
                  maliciousFound = true;
                  
                  showNotification("Suspicious link detected!", true);
              } else {
                  showNotification("No suspicious links detected.", false);
              }
          } else {
              console.log("No response received from background script");
          }
      });
    });

    console.log("Scanning completed.");
  } else {
    console.log("No message body found.");
  }
}*/

async function scanLinks(messageBody) {
  if (messageBody) {
    console.log("Message body detected. Scanning for links...");

    const links = messageBody.querySelectorAll('a');
    let maliciousLinks = [];  // Array to collect malicious links

    for (const link of links) {
      console.log(`Scanning link: ${link.href}`);

      // Send message to background script to check link with VirusTotal
      await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'scanLink', url: link.href }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Runtime error:", chrome.runtime.lastError.message);
            showNotification("Error scanning link.", true);  // Notify user of error
            resolve();  // Continue to the next link
            return;
          }

          if (response && response.malicious) {
            maliciousLinks.push(link.href.slice(0, -1));
          }ec

          resolve();  // Continue to the next link
        });
      });
    }

    // Once all links are scanned, show a notification with the result
    if (maliciousLinks.length > 0) {
      showNotification(`Suspicious links detected\n${maliciousLinks.join('\n')}`, true);
    } else {
      showNotification("No suspicious links detected.", false);
    }

    console.log("Scanning completed.");
  } else {
    console.log("No message body found.");
  }
}

function showNotification(message, isMalicious) {
  // Remove any existing notifications first to avoid duplicates
  const existingNotification = document.querySelector('.email-link-scanner-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  
  // Set the background color based on whether the link is malicious or safe
  notification.style.backgroundColor = isMalicious ? '#f44336' : '#4CAF50';  
  notification.style.color = 'white';
  notification.style.position = 'fixed';
  notification.style.bottom = '10px';
  notification.style.right = '10px';
  notification.style.padding = '10px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '9999';
  notification.style.whiteSpace = 'pre-wrap'; 
  notification.className = 'email-link-scanner-notification';  // Add a class for easier identification
  notification.textContent = message;

  // Add a close button to dismiss the notification
  const closeButton = document.createElement('button');
  closeButton.textContent = 'x';
  closeButton.style.marginLeft = '10px';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.addEventListener('click', () => {
    notification.remove();
  });

  notification.appendChild(closeButton);
  
  // Append the notification to the body
  document.body.appendChild(notification);

  // Remove the notification after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 10000);  // Adjust the duration as needed
}

// Function to find the message container dynamically
function findMessageContainer() {
  let messageBody = document.querySelector('div.ii.gt, div.a3s.aXjCH');
  
  if (messageBody) {
    scanLinks(messageBody);  // If message body found, scan it for links
  } else {
    console.log("No message container found yet. Retrying...");
    setTimeout(findMessageContainer, 500);  
  }
}

// Start observing for URL changes (i.e., when navigating between Gmail messages)
function observeURLChanges() {
  setInterval(() => {
    if (window.location.href !== currentURL) {
      console.log("URL changed, detecting new message...");
      currentURL = window.location.href;
      findMessageContainer();
    }
  }, 500);  // Reduce interval to 500ms
  
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
          findMessageContainer();
        }
      });
    });

    observer.observe(messageContainer, { childList: true, subtree: true });
  } else {
    console.log('Main message container not found. Retrying in 500ms...');
    setTimeout(startObservingMessages, 500); // Retry if not found
  }
}


async function initialize() {
  await getCompletedReadyState();  // Wait until the page is fully loaded
  console.log('Page is fully loaded. Starting extension...');
  
  startObservingMessages();
  observeURLChanges();
}

initialize();