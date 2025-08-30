const indianMaleNames = [
  'Arjun', 'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Sai', 'Aryan', 'Krishna', 
  'Ishaan', 'Shaurya', 'Atharv', 'Advait', 'Vedant', 'Kabir', 'Abhimanyu',
  'Karthik', 'Rohan', 'Rahul', 'Vikram', 'Rajesh', 'Suresh', 'Mahesh', 'Dinesh',
  'Ramesh', 'Ganesh', 'Mukesh', 'Ritesh', 'Hitesh', 'Naresh', 'Yogesh',
  'Amit', 'Sumit', 'Rohit', 'Mohit', 'Lalit', 'Ajit', 'Ravi', 'Kavi',
  'Dev', 'Raj', 'Jay', 'Vijay', 'Sanjay', 'Ajay', 'Akshay', 'Uday',
  'Harsh', 'Darsh', 'Sparsh', 'Utkarsh', 'Aakash', 'Prakash', 'Subhash', 'Vikash',
  'Ankit', 'Rohit', 'Sumit', 'Amit', 'Lalit', 'Mohit', 'Kirit', 'Smit'
];

const indianSurnames = [
  'Sharma', 'Verma', 'Gupta', 'Agarwal', 'Singh', 'Kumar', 'Jain', 'Bansal',
  'Mittal', 'Goel', 'Aggarwal', 'Mahajan', 'Chopra', 'Kapoor', 'Malhotra', 'Khanna',
  'Arora', 'Sethi', 'Bhatia', 'Sood', 'Anand', 'Saxena', 'Tiwari', 'Mishra',
  'Pandey', 'Shukla', 'Dubey', 'Chaturvedi', 'Srivastava', 'Tripathi', 'Upadhyay', 'Joshi',
  'Nair', 'Menon', 'Pillai', 'Reddy', 'Rao', 'Naidu', 'Chandra', 'Prasad',
  'Iyer', 'Iyengar', 'Raman', 'Krishnan', 'Subramanian', 'Venkatesh', 'Ramesh', 'Suresh'
];

const techTerms = [
  'Dev', 'Code', 'Tech', 'Digital', 'Cyber', 'Net', 'Web', 'App', 'Data', 'Cloud',
  'AI', 'ML', 'Bot', 'Hack', 'Pro', 'Expert', 'Master', 'Ninja', 'Guru', 'Wizard'
];

export function generateRandomUsername(): string {
  const firstName = indianMaleNames[Math.floor(Math.random() * indianMaleNames.length)];
  const lastName = indianSurnames[Math.floor(Math.random() * indianSurnames.length)];
  const techTerm = techTerms[Math.floor(Math.random() * techTerms.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  // Generate different username patterns
  const patterns = [
    `${firstName}${lastName}${number}`,
    `${firstName}${techTerm}${number}`,
    `${firstName}_${lastName}`,
    `${firstName}${number}`,
    `${techTerm}${firstName}${number}`,
    `${firstName}${lastName}${techTerm}`
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
}

export function generateUserId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

export function generateNotificationId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

export function playNotificationSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    // Fallback for browsers that don't support Web Audio API
    console.log('Notification sound not supported');
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateSecurePassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}