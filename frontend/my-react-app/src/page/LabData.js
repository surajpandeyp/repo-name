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
    name: 'SQL Injection Lab',
    category: 'web',
    difficulty: 'Easy',
    os: 'Linux',
    xp: '15',
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    
    // Naye fields yaha add karo:
    about: 'Master the art of SQL Injection by exploiting vulnerable web forms.',
    objectives: [
      'Discover hidden directories and enumerate target applications for user accounts.',
      'Use specialized techniques to uncover credentials and system weaknesses.',
      'Gain initial access and escalate privileges to obtain root access.'
    ],
    labDescription: 'In this lab, you will systematically evaluate environment configurations, uncover vulnerabilities, and exploit flaws to successfully retrieve target flags securely.'
  },
];

// CTF Labs
export const CtfLabs = [
  { 
    id: 'ctf-1',
    premium:'Free', 
    name: 'smb_ssh_php', 
    category: 'ctf',
    difficulty: 'Hard', 
    os: 'Linux', 
    xp: '50', 
    users: '200',
    description: 'A comprehensive challenge requiring diverse skill sets from crypto to web exploitation.'
  },

   { 
    id: 'ctf-2',
    premium:'VIP', 
    name: 'cmd_node', 
    category: 'ctf',
    difficulty: 'Hard', 
    os: 'Linux', 
    xp: '50', 
    users: '200',
    description: 'A comprehensive challenge requiring diverse skill sets from crypto to web exploitation.'
  }
];


export const allLabs = [...PivotingLabs, ...WebLabs, ...CtfLabs];