const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

async function runLocalAutomation() {
  console.log('🚀 Capturing Direct Custom Payment Modals...');
  
  const localAppDir = process.env.LOCALAPPDATA || '';
  const executablePath = path.join(localAppDir, 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe');
  
  if (!fs.existsSync(executablePath)) {
    console.error('❌ Chromium executable not found at:', executablePath);
    return;
  }

  const browser = await chromium.launch({
    executablePath,
    headless: false,
    viewport: { width: 1280, height: 800 }
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const artifactDir = 'C:\\Users\\ARYAN PARMAR\\.gemini\\antigravity-ide\\brain\\3946fd91-f687-463c-bc9d-b561bf6cd0e3';

  console.log('📸 Capturing Direct Payment Selector Frame...');
  await page.goto('http://localhost:3000/cart', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(artifactDir, 'demo_frame_12_direct_payments.png'), fullPage: false });

  await browser.close();
  console.log('🎉 Direct Payment Selector Frame Captured Successfully!');
}

runLocalAutomation();
