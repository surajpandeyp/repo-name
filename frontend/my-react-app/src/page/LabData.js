// Pivoting Labs
export const PivotingLabs = [
  { 
    id: 'pivoting-1', 
    name: 'ColdBoxEasy', 
    category: 'pivoting',
    difficulty: 'Fundamental', 
    os: 'Linux', 
    xp: '10', 
    users: '1,093',
    description: 'A beginner-friendly Linux lab focused on basic enumeration and privilege escalation techniques.'
  },
  { 
    id: 'pivoting-2', 
    name: 'Sams', 
    category: 'pivoting',
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
    name: 'SQL Injection Lab', 
    category: 'web',
    difficulty: 'Easy', 
    os: 'Linux', 
    xp: '15', 
    users: '850',
    description: 'Master the art of SQL Injection by exploiting vulnerable web forms.'
  }
];

// CTF Labs
export const CtfLabs = [
  { 
    id: 'ctf-1', 
    name: 'vertex-portal-image', 
    category: 'ctf',
    difficulty: 'Hard', 
    os: 'Linux', 
    xp: '50', 
    users: '200',
    description: 'A comprehensive challenge requiring diverse skill sets from crypto to web exploitation.'
  }
];


export const allLabs = [...PivotingLabs, ...WebLabs, ...CtfLabs];