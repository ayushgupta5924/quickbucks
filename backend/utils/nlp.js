const natural = require('natural');

function parseNaturalLanguage(input) {
  const result = {
    name: '',
    category: 'other',
    priority: 'medium',
    dueDate: null,
    reward: 0
  };
  
  // Extract reward amount
  const rewardPatterns = [
    /(?:₹|rs\.?|rupees?)\s*(\d+)/i,
    /(\d+)\s*(?:₹|rs\.?|rupees?)/i,
    /for\s+(\d+)/i,
    /worth\s+(\d+)/i
  ];
  
  for (const pattern of rewardPatterns) {
    const match = input.match(pattern);
    if (match) {
      result.reward = parseInt(match[1]);
      break;
    }
  }
  
  // Extract due dates
  const datePatterns = [
    { pattern: /by\s+(today|tomorrow)/i, handler: (match) => getRelativeDate(match[1]) },
    { pattern: /by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, handler: (match) => getNextWeekday(match[1]) }
  ];
  
  for (const { pattern, handler } of datePatterns) {
    const match = input.match(pattern);
    if (match) {
      result.dueDate = handler(match);
      break;
    }
  }
  
  // Extract category using NLP
  const categoryKeywords = {
    work: ['work', 'office', 'meeting', 'report', 'presentation', 'project', 'client', 'business'],
    health: ['workout', 'exercise', 'gym', 'run', 'walk', 'doctor', 'medicine', 'health', 'fitness'],
    personal: ['clean', 'laundry', 'shopping', 'groceries', 'home', 'family', 'friend', 'personal'],
    learning: ['study', 'learn', 'read', 'course', 'tutorial', 'practice', 'research', 'book']
  };
  
  const tokens = natural.WordTokenizer.tokenize(input.toLowerCase());
  const stemmer = natural.PorterStemmer;
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const stemmedKeywords = keywords.map(word => stemmer.stem(word));
    const stemmedTokens = tokens.map(token => stemmer.stem(token));
    
    if (stemmedKeywords.some(keyword => stemmedTokens.includes(keyword))) {
      result.category = category;
      break;
    }
  }
  
  // Extract priority
  const urgencyKeywords = {
    high: ['urgent', 'asap', 'immediately', 'critical', 'important', 'priority'],
    low: ['later', 'sometime', 'eventually', 'when possible', 'low priority']
  };
  
  for (const [priority, keywords] of Object.entries(urgencyKeywords)) {
    if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
      result.priority = priority;
      break;
    }
  }
  
  // Extract task name
  let taskName = input;
  taskName = taskName.replace(/(?:for\s+)?(?:₹|rs\.?|rupees?)\s*\d+/gi, '');
  taskName = taskName.replace(/\d+\s*(?:₹|rs\.?|rupees?)/gi, '');
  taskName = taskName.replace(/by\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '');
  taskName = taskName.replace(/\b(urgent|asap|immediately|critical|important|priority|later|sometime|eventually|when possible|low priority)\b/gi, '');
  taskName = taskName.replace(/\s+/g, ' ').trim();
  taskName = taskName.replace(/^(finish|complete|do|make|create|write|send)\s+/i, '');
  
  result.name = taskName || 'New Task';
  
  return result;
}

function getRelativeDate(day) {
  const today = new Date();
  if (day.toLowerCase() === 'today') {
    return today;
  } else if (day.toLowerCase() === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  }
  return null;
}

function getNextWeekday(dayName) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(dayName.toLowerCase());
  
  if (targetDay === -1) return null;
  
  const today = new Date();
  const currentDay = today.getDay();
  let daysUntilTarget = targetDay - currentDay;
  
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);
  return targetDate;
}

module.exports = { parseNaturalLanguage };