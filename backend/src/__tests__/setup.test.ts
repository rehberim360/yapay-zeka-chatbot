/**
 * Basic setup test to verify Jest configuration
 */

describe('Jest Setup', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should support TypeScript', () => {
    const testValue: string = 'TypeScript works';
    expect(testValue).toBe('TypeScript works');
  });

  it('should support async/await', async () => {
    const asyncValue = await Promise.resolve('async works');
    expect(asyncValue).toBe('async works');
  });
});
