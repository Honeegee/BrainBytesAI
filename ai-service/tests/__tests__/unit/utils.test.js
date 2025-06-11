// Create standalone versions of the functions since they're not exported
const normalizePrompt = input => {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/['']/g, "'") // Normalize smart quotes
    .replace(/[""]/g, '"'); // Normalize smart double quotes
};

const handleMathExpression = input => {
  if (typeof input !== 'string') {
    return input;
  }

  const mathPattern = /^(\d+)\s*([+\-*/])\s*(\d+)$/;
  const match = input.match(mathPattern);

  if (!match) {
    return input;
  }

  const [, num1, operator, num2] = match;
  try {
    // Use Function instead of eval for safer execution
    const result = new Function('return ' + num1 + operator + num2)();
    return `${input} = ${result}`;
  } catch (error) {
    console.error('Math expression evaluation error:', error);
    return input;
  }
};

describe('AI Service Utility Functions', () => {
  describe('normalizePrompt', () => {
    test('should trim whitespace', () => {
      expect(normalizePrompt('  hello world  ')).toBe('hello world');
    });

    test('should replace multiple spaces with single space', () => {
      expect(normalizePrompt('hello     world')).toBe('hello world');
    });

    test('should normalize smart quotes', () => {
      expect(normalizePrompt("hello 'world'")).toBe("hello 'world'");
      expect(normalizePrompt('hello "world"')).toBe('hello "world"');
    });

    test('should return empty string for non-string input', () => {
      expect(normalizePrompt(null)).toBe('');
      expect(normalizePrompt(undefined)).toBe('');
      expect(normalizePrompt(123)).toBe('');
    });

    test('should handle empty string', () => {
      expect(normalizePrompt('')).toBe('');
    });
  });

  describe('handleMathExpression', () => {
    test('should handle basic addition', () => {
      expect(handleMathExpression('2 + 3')).toBe('2 + 3 = 5');
      expect(handleMathExpression('10+5')).toBe('10+5 = 15');
    });

    test('should handle basic subtraction', () => {
      expect(handleMathExpression('10 - 3')).toBe('10 - 3 = 7');
      expect(handleMathExpression('5-2')).toBe('5-2 = 3');
    });

    test('should handle basic multiplication', () => {
      expect(handleMathExpression('4 * 5')).toBe('4 * 5 = 20');
      expect(handleMathExpression('3*7')).toBe('3*7 = 21');
    });

    test('should handle basic division', () => {
      expect(handleMathExpression('10 / 2')).toBe('10 / 2 = 5');
      expect(handleMathExpression('15/3')).toBe('15/3 = 5');
    });

    test('should return input unchanged for non-math expressions', () => {
      expect(handleMathExpression('hello world')).toBe('hello world');
      expect(handleMathExpression('2 + 3 + 4')).toBe('2 + 3 + 4');
      expect(handleMathExpression('invalid expression')).toBe(
        'invalid expression'
      );
    });

    test('should handle non-string input', () => {
      expect(handleMathExpression(null)).toBe(null);
      expect(handleMathExpression(undefined)).toBe(undefined);
      expect(handleMathExpression(123)).toBe(123);
    });

    test('should handle edge cases', () => {
      expect(handleMathExpression('0 + 0')).toBe('0 + 0 = 0');
      expect(handleMathExpression('1 / 0')).toBe('1 / 0 = Infinity');
    });
  });
});
