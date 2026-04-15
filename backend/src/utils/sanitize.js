// Security: Sanitize user input before AI prompts
// Prevents prompt injection attacks

const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+instructions/gi,
  /system\s+prompt/gi,
  /you\s+are\s+now/gi,
  /forget\s+(everything|all|previous)/gi,
  /act\s+as\s+(a\s+)?different/gi,
  /reveal\s+(other|all|every)/gi,
  /bypass\s+(security|restrictions|rules)/gi,
  /jailbreak/gi,
  /do\s+anything\s+now/gi,
  /dan\s+mode/gi,
];

const sanitizeForPrompt = (text) => {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  // Remove injection patterns
  INJECTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REMOVED]');
  });

  // Limit length to prevent token abuse
  sanitized = sanitized.slice(0, 10000);

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/\0/g, '').replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized.trim();
};

const sanitizeQuestion = (question) => {
  if (!question || typeof question !== 'string') return '';
  let sanitized = sanitizeForPrompt(question);
  // Questions should be max 500 chars
  return sanitized.slice(0, 500);
};

module.exports = { sanitizeForPrompt, sanitizeQuestion };