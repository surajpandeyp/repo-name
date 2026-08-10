// Pivoting Labs
export const PivotingLabs = [
  { 
    id: 'pivoting-1', 
    premium:'Free',
    name: 'ColdBoxEasy', 
    category: 'test-pivot',
    difficulty: 'Fundamental', 
    os: 'Linux', 
    xp: '10', 
    users: '1,093',
    description: 'A beginner-friendly Linux lab focused on basic enumeration and privilege escalation techniques.'
  },
  { 
    id: 'pivoting-2',
    premium:'VIP', 
    name: 'Sams', 
    category: 'test-pivot',
    difficulty: 'Fundamental', 
    os: 'Windows', 
    xp: '20', 
    users: '418',
    description: 'An introductory Windows lab covering SMB exploitation and basic Active Directory concepts.'
  }
];

// Web Labs
export const WebLabs = [
  

   {
    id: 'web-1',
    premium: 'Free',
    name: 'CVE-2023-6019',
    category: 'web',
    difficulty: 'medium',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'This challenge introduces participants to a real-world vulnerability found in the Ray framework (specifically version 2.6.3) running on port 8265. Participants must perform reconnaissance against the target web application, identify the exposed Ray Dashboard service, discover the unauthenticated remote code execution flaw, and successfully exploit it to gain an initial foothold on the server and retrieve the flag.',
    objectives: [
      'Vulnerability Identification: Discover that the target is running a vulnerable version of the Ray framework (v2.6.3) susceptible to CVE-2023-6019.',
      'Deep Vulnerability Analysis: Investigate the target running version 2.6.3 (CVE-2023-6019) and analyze why standard automated exploits fail due to security controls or configuration constraints',
      'Exploitation & Adaptation: Perform advanced reconnaissance against the application endpoints to tailor the payload and successfully execute remote code execution.',
      'Initial Foothold & Flag Retrieval: Establish an initial foothold within the server and locate the final lab flag'
    ],

    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },
  

  {
    id: 'web-2',
    premium: 'VIP',
    name: 'Disclosure',
    category: 'web',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'This challenge simulates a realistic web penetration testing scenario where participants are presented with an interactive web interface. To gain access, attackers must first perform thorough web reconnaissance using directory bruteforcing techniques to discover hidden endpoints. Uncovering a sensitive exposed backup file reveals critical implementation clues and input handling details. Participants must analyze this file to understand how to leverage the web input interface for command injection, execute remote commands on the underlying system, achieve an initial foothold, and capture the final flag.',
    objectives: [
      'Web Reconnaissance & Discovery: Perform directory and file bruteforcing against the target web application to uncover hidden or unlinked paths.',
      'Backup File Analysis: Locate and read an exposed sensitive backup file, analyzing its contents to understand application logic and potential input vulnerabilities.',
      'Exploitation & Initial Access: Leverage the insights gained from the backup file to craft malicious input through the web interface, achieving remote code execution (RCE) on the internal system',
      'Flag Retrieval: Navigate the system environment via the executed commands to locate and capture the final lab flag'
    ],

    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },

  {
    id: 'web-3',
    premium: 'VIP',
    name: 'CVE-2024-40453',
    category: 'web',
    difficulty: 'medium',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    about: 'CVE-2024-40453 is a critical code injection vulnerability CVSS score: 9.8 in Squirrelly, a popular JavaScript template engine for Node.js. Unauthenticated',
    objectives: [
        'Application Reconnaissance: Applocation runing on 3000 and Analyze the web application s routing and endpoint behavior to understand how query parameters (useW',
        'Vulnerability Identification: Recognize the insecure use of dynamic evaluation (eval) combined with object destructuring parameter structures.',
        'Payload Crafting & Exploitation: Construct customized query payloads leveraging JavaScript object destructuring and default expression evaluation to bypass rest',
        'Initial Foothold & Flag Retrieval: Secure an initial shell session via the executed commands, navigate the environment, and capture the final lab flag.'
    ],

    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve targ'
},


{
    id: 'web-4',
    premium: 'VIP',
    name: 'WebShell',
    category: 'web',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    about: 'This challenge simulates a comprehensive web penetration testing scenario where participants interact with a custom dashboard featuring integrated reconnaissance tools such as Nmap and directory bruteforcing (Gobuster). Attackers must first perform target reconnaissance to map out the application s structure. Uncovering sensitive paths leads to an unlocked file upload interface, where participants must bypass security restrictions, upload a malicious web shell to achieve remote code execution (RCE), navigate the environment, and capture the final flag.',
    objectives: [
        'Target Reconnaissance: Utilize simulated interface tools (Nmap and directory enumeration) to gather intelligence on active services and hidden directories.',
        'Interface Unlocking: Complete the reconnaissance phase to unlock the restricted file upload functionality.',
        'Exploitation & Web Shell Deployment: Craft and upload a payload through the file upload mechanism to execute commands on the underlying server.',
        'Initial Access & Flag Capture: Secure an initial foothold via the uploaded web shell, navigate the directory structure, and locate the final lab flag.'
    ],

    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve targ'
},
  
{
    id: 'web-5',
    premium: 'VIP',
    name: 'Signature',
    category: 'web',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    about: 'In this lab, you need to exploit a vulnerable JSON Web Token (JWT) implementation. First, perform reconnaissance to  find  secret key, use that key to manually sign and modify a token, elevate privileges from a regular user to an admin, and access the admin dashboard to capture the flag',
    objectives: [
        'Initial Access: Log into the application using the credentials (maffy / maffy12) and inspect the session cookie or JWT token.',
        'token Tampering: Use the recovered secret key to modify the role parameter in the JWT payload from user to admin and re-sign the token.',
        'Privilege Escalation: Pass the modified token back into the application to gain access to the admin panel.',
        'Flag Capture: Retrieve the final flag from the restricted admin section.'
    ],

    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve targ'
},


{
    id: 'web-6',
    premium: 'VIP',
    name: 'CVE-2024-46986',
    category: 'web',
    difficulty: 'Hard',
    os: 'Linux',
    xp: '30',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    about: 'This challenge simulates a realistic enterprise penetration testing scenario involving Camaleon CMS 2.8.0 CVE-2024-46986. Participants must first authenticate to the crm first find admin login route and  application using default or weak credentials (such as admin / admin) to access the administrative dashboard. Once inside, user must discover and exploit an unvalidated file upload mechanism combined with path traversal techniques to place a malicious Ruby script directly into an automatic execution directory (such as config/initializers/). When the server processes or reloads the configuration, the uploaded script is automatically executed, granting a reverse shell back to the attacker and enabling final flag retrieval',
    objectives: [
        'Initial Authentication: Log into the web application using default administrator credentials (e.g., admin / admin) to gain access to the main dashboard interface.',
        'Reconstruction & Vulnerability Discovery: Inspect the application functionality to identify file upload features and unvalidated path handling parameters',
        'Path Traversal & Script Placement: Exploit the file upload vector using directory traversal sequences to write a malicious Ruby payload into the automatic execution directory (config/initializers/).',
        'Remote Code Execution & Reverse Shell: Trigger script execution to establish a stable TCP connection back to the attacker listener.',
        'Flag Retrieval: Navigate the underlying system environment via the shell session to locate and capture the final lab flag.'
      ],


    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve targ'
},


{
    id: 'web-7',
    premium: 'VIP',
    name: 'Jwt',
    category: 'web',
    difficulty: 'Medium',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    about: 'This challenge simulates an authentication bypass vulnerability  Usernames carlos password carlos123 involving JSON Web Tokens (JWT). During the login process, the application signs tokens using a private key, but the backend middleware validation logic improperly verifies incoming requests using a public key instead of enforcing the expected signing algorithm. Participants must first perform web reconnaissance to discover or extract the exposed public key from the application assets. Using this public key as an HMAC secret, attackers forge a new JWT token with a modified algorithm, elevating their session privileges to administrator and gaining access to restricted control panels. Finally, participants navigate the user s home directory to locate and retrieve the flag stored in flag.txt',
    objectives: [
        'Web Reconnaissance: Inspect application endpoints and discover exposed assets, public keys, or configuration files.',
        'Vulnerability Analysis: Identify the flaw in JWT middleware validation where the verification routine misuses keys and allows algorithm manipulation HS256 ',
        'Token Forgeries: Construct a custom script or tool to sign a forged administrative token using the retrieved public key and modified algorithm parameters',
        'Privilege Escalation: Bypass authentication controls using the crafted JWT token to access the admin dashboard.',
        'Flag Retrieval: Explore the home directory of the system environment to locate and read flag.txt for the final flag.'
      ],


    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve targ'
},

{
    id: 'web-8',
    premium: 'VIP',
    name: 'CVE-2024-24550',
    category: 'web',
    difficulty: 'Medium',
    os: 'Linux',
    xp: '20',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    about: 'Bludit 3.14.0 is primarily affected by a Remote Code Execution (RCE) vulnerability and an associated Command Injection flaw (CVE-2024-24550 / GCVE-0-2024-24550).',
    objectives: [
        'Authentication & Access: Navigate to the Bludit admin login page. Log in using the valid credentials: admin / suraj12',
        'Once inside the admin dashboard, navigate to the thim or  section to retrieve the users API Token (required for automated or authenticated requests)',
        'Use or modify an existing exploit script (such as a Python-based payload tailored for Bludit file upload or plugin manipulation) found during the reconnaissance phase',
        'Trigger the uploaded script or payload via the browser or netcat listener to catch the reverse shell.',
        'Navigate through the container directories to read the system flag (/var/www/html/flag.txt) and clear the lab successfully!'
      ],


    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve targ'
},


{
    id: 'web-9',
    premium: 'VIP',
    name: 'CVE-2025-34030',
    category: 'web',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    about: 'Identify the unauthenticated Remote Code Execution vulnerability (CVE-2025-34030) affecting sar2html versions 3.2.2 and prior, inject OS commands via the vulnerable parameter to establish a reverse shell, escalate privileges or locate the hidden system flag, and capture the flag to complete the lab.',
    objectives: [
        'Perform  web directory enumeration to identify the running sar2html application.',
        'Discover that the application is vulnerable to CVE-2025-34030, where the plot parameter in index.php improperly sanitizes user-supplied input before passing it to system shell execution functions',
        'Craft a malicious HTTP request or use a customized exploit script targeting the vulnerable parameter.',
        'Append command separators (such as ;, |, or &) along with netcat or bash reverse shell payloads to execute arbitrary OS commands.',
        'Navigate through the container directories to read the system flag (/var/www/html/flag.txt) and clear the lab successfully!'
         
      ],


    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve targ'
},



{
    id: 'web-10',
    premium: 'VIP',
    name: 'BreachAPI',
    category: 'web',
    difficulty: 'Midium',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    about: 'Perform directory brute-forcing to discover hidden API endpoints, extract a valid referral token via API enumeration to register a new user account, leverage the discovered API endpoints to update user privileges to admin, and access the restricted admin panel to capture the flag.',
    objectives: [
        'Scan the target web application using directory brute-forcing tools (like Gobuster or ffuf) to discover hidden directories and undocumented API endpoints (e.g., /api/v1/auth, /api/v1/register',
        'Discover that user registration requires a special referral token. Query the exposed API endpoints or configuration files to locate and extract a valid referral token.',
        'Use the extracted referral token alongside standard user details to successfully register a new standard user account on the platform.',
        'Interact with the discovered API endpoints modify user role parameters is_admin 1',
        'Access the restricted administrative dashboard using the new admin rights to retrieve the hidden system flag (flag{api_recon_secret_flag_2026}) and complete the lab!'
         
      ],


    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve targ'
},


{
    id: 'web-11',
    premium: 'VIP',
    name: 'Loopback',
    category: 'web',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    about: 'Perform source code review and reconnaissance to discover hidden internal proxy endpoints, identify the vulnerable SSRF query parameter, and leverage server-side requests to bypass IP restrictions on the secure admin panel (/admin) to capture the hidden system flag',
    objectives: [
        'Analyze the application endpoints or perform directory enumeration to discover hidden routes (such as /internal-proxy-api and the fetcher interface).',
        'dentify that the /fetch endpoint accepts a url parameter and executes backend requests using the server s network stack without proper input validation.',
        'Craft an SSRF payload targeting the restricted local admin route http://127.0.0.1:3000/admin',
        'Force the server to fetch the internal resource on your behalf, successfully bypassing the localhost IP restriction check and returning the hidden flag  to conquer the lab',
        
         
      ],


    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve targ'
}









];

// CTF Labs
export const CtfLabs = [

   {
    id: 'ctf-1',
    premium: 'Free',
    name: 'CVE-2024-32880',
    category: 'ctf',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'In this lab, you will interact with a target system running pyLoad, an open-source download manager. Due to improper input validation and configuration handling, the application suffers from CVE-2024-32880, which allows authenticated attackers to manipulate download paths and achieve Remote Code Execution (RCE). Once inside the system as a low-privileged user, you must pivot your focus to local enumeration, find misconfigurations, and exploit a custom SUID binary to capture the root flag.',
    objectives: [
      'Discovering running services and identifying vulnerable application versions (pyLoad) and use defoult passwrd to login crm',
      'Exploiting CVE-2024-32880 by manipulating the designated download directory and leveraging template injection or arbitrary file upload mechanisms to execute system commands..',
      'Identifying misconfigured SUID (SetOwner User ID) binaries on the system.'
    ],
    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },
  
   {
    id: 'ctf-2',
    premium: 'VIP',
    name: 'Breakout',
    category: 'ctf',
    difficulty: 'Medium',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'In this lab, the journey begins on a target system where the user establishes an initial connection or C2 shell using basic listener tools like nc. Once inside as a low-privileged user, the participant performs system reconnaissance and discovers a custom C source file (vuln.c). Upon analyzing the source code, they uncover a logic flaw or unvalidated input mechanism tied to a binary executable with misconfigured sudo permissions. By leveraging the internal system("/bin/bash") function or manipulating the binary s execution flow, the user successfully escalates their privileges straight to root.',
    objectives: [
      'Catching and stabilizing reverse shells using standard netcat (nc) listeners',
      'Searching for custom source code files (vuln.c) left on the system or hidden configurations',
      'Inspecting current user sudo privileges using commands like sudo -l to find misconfigured binaries',
      'Analyzing C source code to identify unsafe execution routines, buffer handling, or hardcoded logic',
      'Understanding how functions like system() or process spawning APIs behave when executed with elevated rights'
    ],
    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },
   
  {
    id: 'ctf-3',
    premium: 'VIP',
    name: 'SecOps',
    category: 'ctf',
    difficulty: 'Medium',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'the environment consists of a Node.js-based web application with an unintended administration command execution vulnerability. Once initial access is established via a reverse shell, the user must perform internal enumeration to discover misconfigurations—specifically a root-level scheduled cron job running a tar command. By exploiting a well-known command-line injection vector within the archiving utility (--checkpoint parameters), the user escalates privileges to root and captures the flag.',
    objectives: [
      'Identifying and leveraging command injection flaws within web-based administrative interfaces to gain system execution',
      'Deploying and catching interactive shell connections (using Bash TCP sockets and Netcat listeners',
      'Systematically searching for privilege escalation vectors, including inspecting system-wide cron jobs (/etc/crontab or /etc/cron.d/',
      'Exploiting insecure tar command invocations using wildcard (*) expansions and checkpoint parameters to achieve arbitrary command execution as a higher-privileged user',
      
    ],
    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },

  {
    id: 'ctf-4',
    premium: 'VIP',
    name: 'CVE-2023-32700',
    category: 'ctf',
    difficulty: 'Hard',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'server runing on port 8080 Exploit a Path Traversal (LFI) vulnerability in the /view endpoint to read app.py and extract the hardcoded Flask secret_key. Use flask-unsign to forge a signed session cookie, elevating privileges to admin.  Initial Access: Exploit CVE-2023-32700 (LuaTeX command injection via io.popen) through a weaponized .tex file to execute arbitrary shell commands. Privilege Escalation: Leverage CVE-2025-50817 (Python future import hijacking via test.py) with sudo rights on a maintenance script to escalate from ctf_user to root and retrieve the flag',
    objectives: [
      'Read sensitive application source code via unvalidated file parameters',
      'Use tools like flask-unsign to tamper with and sign weak cryptographic cookies',
      'LaTeX Engine Command Injection: Understand how insecure compiler configurations and flawed Lua sandboxes (io.popen) allow remote code execution through document compilation (CVE-2023-32700)',
      'Python Supply Chain & Import Hijacking: Analyze insecure module search paths, writable execution contexts, and how third-party package vulnerabilities lead to code execution via test.py (CVE-2025-50817)',
      'Sudo Rights Misconfiguration Auditing: Identify dangerous NOPASSWD entries in /etc/sudoers files and evaluate script execution logic for security loopholes.',
      'Learn how to combine an initial exploitation vector with a local system flaw to successfully escalate privileges from a standard user to root',
      'Remediation & Secure Coding: Implement strict sandboxing for document compilers, update vulnerable third-party libraries, and enforce strict file permission controls to harden production environments'
    ],
    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },
   
  {
    id: 'ctf-5',
    premium: 'VIP',
    name: 'CVE-2024-40422',
    category: 'ctf',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '20',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'CVE-2024-40422 is a critical Path Traversal vulnerability in Stitionai Devika v1. It allows unauthenticated remote attackers to bypass directory restrictions and access arbitrary, sensitive files on the server by manipulating the snapshot_path parameter in the /api/get-browser-snapshot endpoint  ',
    objectives: [
      'Identify and exploit unvalidated file parameters to read unauthorized system files.',
      'Extract sensitive configuration assets  in /app directory and private id_rsa keys from target environments',
      'Utilize extracted private keys for secure remote shell access and privilege validation.',
    
    ],
    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },

   {
    id: 'ctf-6',
    premium: 'VIP',
    name: 'CVE-2025-27136',
    category: 'ctf',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '20',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: ' XML External Entity XXE injection vulnerability found in the bucket creation endpoint CreateBucketConfiguration of LocalS3 When processing bucket creation requests, LocalS3 uses a Jackson XML parser initialized without restrictions against Document Type Declarations DTDs or external entities The attacker interacts with the LocalS3 service and exploits an XML-based parsing vulnerability (such as XXE) to read sensitive internal assets, specifically targeting and extracting the root user  SSH private key (id_rsa) from the file system ',
    objectives: [
      'XML Vulnerability Exploitation: Identify and abuse improper XML parsing configurations within file management services like LocalS3 to disclose sensitive files.',
      'Recognize the extreme security risks of world-writable sensitive configuration and system files like /etc/passwd',
      'Understand how cryptographic utilities like openssl can be abused to generate valid shadow or passwd hashes for local privilege escalation',
    
    ],
    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },


  {
    id: 'ctf-7',
    premium: 'VIP',
    name: 'CVE-2025-50946',
    category: 'ctf',
    difficulty: 'Medium',
    os: 'Linux',
    xp: '20',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'CVE-2025-50946 is an OS command injection vulnerability in OliveTin (versions up to 2025.4.22) that allows remote, unauthenticated attackers to execute arbitrary system commands via the ParseRequestURI function in service/internal/executor/ ',
    objectives: [
      'Nmap against the target IP or network range to discover open ports, scan for running services, and detect service versions',
      'Vulnerability Assessment: Identify and fingerprint software versions susceptible to CVE-2025-50946.',
      'Exploitation & Foothold: Execute targeted exploits to bypass service restrictions and gain authorized-simulation access on the target machine',
      'System Enumeration & Privileged Search: Practice advanced Linux file-searching and enumeration techniques to uncover deep-seated sensitive files and root flags',
    
    ],
    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },


  {
    id: 'ctf-8',
    premium: 'VIP',
    name: 'NodeForge',
    category: 'ctf',
    difficulty: 'Medium',
    os: 'Linux',
    xp: '20',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'This realistic penetration testing laboratory simulates a vulnerable Node.js web application where an attacker must chain weak credential validation, parameter-based access control bypass, and file upload execution to achieve full system compromise: ',
    objectives: [
      'Nmap against the target IP or network range to discover open ports, scan for running services, and detect service versions',
      'Initial Access & Authentication: The attacker starts by performing credential brute-forcing or testing default credentials against the application  login form to gain entry into the dashboard.',
      'Access Control Bypass & Arbitrary File Upload: Inside the admin panel, the user discovers a file upload feature. By manipulating a client-side or hidden request parameter (shifting a value from 0 to 1), the file type or restriction check is bypassed, allowing the upload of a malicious script',
      'Parameter Manipulation & Upload Bypasses: Learn how client-side checks and parameter values (like binary status flags) can be altered to bypass file upload filters',    
      "Web Shell Execution: Understand how storing executable scripts in web-accessible directories leads to direct remote code execution",
      "Remote Code Execution (RCE): Sending a subsequent GET request to the uploaded file path (/uploads/filename.js or similar) within the server directory triggers code execution, establishing an initial web shell or command execution context",
      "Running sudo -l reveals a maintenance script executed with root privileges that .",
    ],
    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },

   {
    id: 'ctf-9',
    premium: 'VIP',
    name: 'TripleEntry',
    category: 'ctf',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '20',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'This lab demonstrates a multi-stage exploitation chain, moving from an insecure service misconfiguration to local privilege escalation through credential harvesting and password cracking ',
    objectives: [
      'Anonymous Enumeration: Enumerate the FTP service using anonymous login to discover exposed configuration files and hardcoded credentials',
      'Initial SSH Access: Leverage discovered credentials to gain an initial shell on the target system via SSH.',
      'nternal Enumeration & Lateral Movement: Explore the compromised users home directory to uncover sensitive hidden notes or credentials belonging to another user.',
      'Group-Based Privilege Escalation: Identify that the secondary user belongs to the privileged shadow group, granting read access to /etc/shadow',
      'Offline Credential Cracking: Extract password hashes from the shadow file and perform offline password cracking using tools like John the Ripper or Hashcat',
      'Root Escalation: Use the cracked credentials to escalate privileges to the root user and capture the final objective.'
    ],

    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },


  {
    id: 'ctf-10',
    premium: 'VIP',
    name: 'SkyWay',
    category: 'ctf',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'This lab features a booking web application where participants first authenticate using valid user credentials (maffy / maffy). Once inside the user panel, they discover a Local File Inclusion (LFI) vulnerability. By exploiting the LFI flaw, participants can read sensitive system files or source code to uncover hidden configurations or secondary credentials. Using those discovered credentials, they log in via SSH, perform local enumeration to locate a misconfigured root-level cron job, and finally escalate privileges to root to capture the flag ',
    objectives: [
      'Exploit LFI: Identify and exploit the Local File Inclusion vulnerability within the booking application interface to extract internal files.',
      'Initial Access: Utilize harvested credentials or application configurations to establish an interactive remote session via SSH..',
      'Privilege Escalation Enumeration: Enumerate background tasks and system processes (such as crontab jobs) to locate insecurely permissioned scripts or binaries.',
      'Root Access: Exploit the writable script executed by the root cron job to gain full root privileges and retrieve the final flag',
      
    ],

    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },


  {
    id: 'ctf-11',
    premium: 'VIP',
    name: 'LogJam',
    category: 'ctf',
    difficulty: 'Hard',
    os: 'Linux',
    xp: '20',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'This intermediate-to-advanced security lab simulates a realistic penetration testing scenario where participants must progress from an initial network footprint to complete system compromise (root access). The environment is designed to test web application assessment skills, local file inclusion (LFI) exploitation, log poisoning techniques, and advanced local privilege escalation via PATH hijacking and C code analysis ',
    objectives: [
      'Execute comprehensive nmap scans to discover open ports, running services, and potential entry points',
      'Perform directory and file enumeration on the web server to identify vulnerable endpoints or exposed administrative panels.',
      'Identify and exploit an LFI vulnerability within the web application to read sensitive system files',
      'Leverage the LFI vector to execute log poisoning via web server access/error logs, achieving initial code execution on the target',
      'Locate and analyze custom C source files and backup scripts left on the file system to understand internal application logic and binary execution flows',
      'Exploit an insecure path execution dependency by crafting a malicious script to intercept system calls, successfully executing a PATH hijacking attack',
      'Escalate privileges to root and capture the final root flag'
    ],

    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },
 
  
  {
    id: 'ctf-12',
    premium: 'VIP',
    name: 'SecOps',
    category: 'ctf',
    difficulty: 'Medium',
    os: 'Linux',
    xp: '20',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'This lab simulates a multi-staggered enterprise penetration testing scenario where the attacker starts with external reconnaissance and progressively moves through multiple layers of security controls. The environment mimics a real-world misconfigured web application coupled with internal network services, requiring a comprehensive hybrid of web exploitation, traffic analysis, lateral movement, and privilege escalation techniques.',
    objectives: [
      'Reconnaissance & Enumeration: Perform network discovery and port scanning (using tools like Nmap) followed by comprehensive web directory brute-forcing to uncover hidden endpoints and administrative interfaces',
      'Web Application Analysis: Investigate the exposed log-monitoring web interface to identify operational patterns and information disclosure vulnerabilities',
      'Traffic Analysis & Credential Harvesting: Analyze captured network traffic logs (such as Wireshark PCAP files) to extract sensitive authentication credentials or access tokens',
      'Access & Lateral Movement: Utilize the harvested credentials to establish an authenticated SSH session into the target environment',
      'Privilege Escalation & Root Access: Conduct deep host-based enumeration, explore misconfigurations, and execute advanced exploitation vectors to achieve final root privileges and capture the ultimate flag (/root/root.txt)',
      
      
    ],

    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },


 {
    id: 'ctf-13',
    premium: 'VIP',
    name: 'NetUtility',
    category: 'ctf',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'This lab places participants in a hybrid enterprise environment where they must leverage cross-service information disclosure. The scenario starts by performing SMB reconnaissance to extract user credentials, combined with web-based user enumeration. Attackers must then utilize the harvested credentials to gain initial access via brute-forcing SSH. Once inside, the objective shifts to local privilege escalation by exploiting misconfigured network utilities to manipulate system processes and capture the root flag',
    objectives: [
      'Service Reconnaissance: Perform SMB enumeration to identify shared resources and extract sensitive user credentials or configuration files.',
      'Web Enumeration: Navigate target web applications to discover additional user accounts, architectural patterns, or hidden data sources',
      'Authentication Attack: Utilize the gathered intelligence to conduct successful brute-force or dictionary attacks against the SSH service',
      'Local Privilege Escalation: Perform internal system enumeration to identify vulnerable network-based utilities.',
      'Root Compromise: Exploit the identified utility misconfigurations  retrieve the final flag (/root/root.txt).',
      
      
    ],

    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },
 

  {
    id: 'ctf-14',
    premium: 'VIP',
    name: 'Breach',
    category: 'ctf',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'This challenge simulates an end-to-end web and system penetration testing engagement. Participants are presented with a web application vulnerable to SQL Injection, which they must exploit to extract user credentials. Using the recovered credentials, attackers authenticate into the web portal, perform service and system reconnaissance to discover additional credentials, establish an SSH session, and ultimately execute a privilege escalation attack to capture the root flag.',
    objectives: [
      'Web Vulnerability Exploitation: Identify and exploit an SQL Injection vulnerability within the web application to dump sensitive user credentials from the database.',
      'Web Authentication & Enumeration: Utilize the extracted credentials to log into the application dashboard and perform further internal reconnaissance.',
      'Initial Foothold (SSH): Leverage additional discovered credentials to gain remote shell access via the SSH service.',
      'System Reconnaissance: Perform thorough internal system enumeration to identify configuration weaknesses, potential misconfigurations, or privilege escalation vectors',
      'Root Compromise: Escalate privileges from a standard user to root and retrieve the final flag from /root/root.txt',
      
      
    ],

    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },

  {
    id: 'ctf-15',
    premium: 'VIP',
    name:'AdminGateway',
    category: 'ctf',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'This challenge simulates a multi-layer web and system penetration testing scenario. Participants are presented with a restricted admin login portal that requires initial credentials (admin / admin123) and implements strict IP-based access restrictions. Attackers must bypass these network controls by manipulating HTTP headers (such as X-Forwarded-For) to simulate a trusted local source (127.0.0.1). Successfully bypassing the gateway grants access to an authenticated dashboard containing sensitive enumeration leads. Using the harvested credentials, participants must establish an SSH session, perform local system reconnaissance, and execute privilege escalation to capture the final root flag',
    objectives: [
      'Access Control Bypass: Intercept HTTP requests and manipulate headers (e.g., X-Forwarded-For: 127.0.0.1) to bypass IP-based administrative restrictions.',
      'Web Authentication & Enumeration: Authenticate via the unlocked admin portal and enumerate the internal dashboard to extract low-level system credentials or configuration clues.',
      'Initial Foothold (SSH): Leverage the recovered credentials to gain remote shell access through the SSH service',
      'Root Compromise: Escalate privileges from a standard user to root and retrieve the final flag from /root/root.txt.',
      
      
    ],

    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },  

  

  ];


export const allLabs = [...PivotingLabs, ...WebLabs, ...CtfLabs];