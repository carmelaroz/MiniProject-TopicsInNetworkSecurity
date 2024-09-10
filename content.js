const suspiciousLink = "https://gezer1.bgu.ac.il/meser";  // Use the main part of the suspicious link
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
function scanLinks(messageBody) {
  if (messageBody) {
    console.log("Message body detected. Scanning for links...");

    const links = messageBody.querySelectorAll('a');
    let maliciousFound = false;  // Flag to track if we find a malicious link

    links.forEach(link => {
      // Check if the link starts with the suspicious link
      if (link.href.startsWith(suspiciousLink)) {
        maliciousFound = true;
      }
    });

    if (maliciousFound) {
      // Show malicious link notification
      showNotification("Suspicious link detected!", true);
    } else {
      // Show safe link notification if no malicious links were found
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
  }, 5000);  // Adjust the duration as needed
}

// Function to find the message container dynamically
function findMessageContainer() {
  //
  //div[role="listitem"], div.ii.gt, div[role="tabpanel"], div.a3s.aXjCH
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