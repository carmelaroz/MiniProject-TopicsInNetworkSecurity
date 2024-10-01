# Gmail Link Scanner - Chrome Extension
### About
Welcome to the Gmail Link Scanner! This Chrome extension scans links in Gmail for potential phishing or malicious content. The extension analyzes the URLs within email messages to detect suspicious links. The tool alerts users when malicious URLs are detected, helping them avoid phishing attacks or unsafe websites.

### Technologies Used
- JavaScript
- Chrome Extensions API
- VirusTotal API

### Features
- Scans links in Gmail for suspicious patterns like IP addresses, suspicious TLDs, and phishing keywords.
- Sends suspicious URLs to VirusTotal for further analysis.
- Alerts users with notifications if malicious URLs are detected.

### How It Works
1. **Link Scanning:** The extension detects links in Gmail messages and checks them against known phishing patterns (e.g., suspicious keywords or TLDs).
2. **VirusTotal API Check:** Links flagged as suspicious are sent to VirusTotal via an API request to verify if they are malicious.
3. **Alerts**: If VirusTotal detects malicious content, a notification alerts the user.

