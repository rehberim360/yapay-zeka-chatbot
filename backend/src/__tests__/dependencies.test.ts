/**
 * Test to verify all required dependencies are installed and can be imported
 */

describe('Dependencies', () => {
  it('should import @google/generative-ai', async () => {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    expect(GoogleGenerativeAI).toBeDefined();
  });

  it('should import puppeteer', async () => {
    const puppeteer = await import('puppeteer');
    expect(puppeteer.default).toBeDefined();
  });

  it('should import turndown', async () => {
    const TurndownService = (await import('turndown')).default;
    expect(TurndownService).toBeDefined();
  });

  it('should import fast-check', async () => {
    const fc = await import('fast-check');
    expect(fc.default).toBeDefined();
  });

  it('should import jest types', () => {
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });
});
