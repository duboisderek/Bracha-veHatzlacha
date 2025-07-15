// Comprehensive multilingual UI testing script
const puppeteer = require('puppeteer');

async function testMultilingualUI() {
  console.log('🧪 Starting Comprehensive Multilingual UI Test...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    console.log('📍 Navigating to application...');
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
    
    // Test 1: Default Language Loading
    console.log('\n🔍 TEST 1: Default Language Loading');
    const defaultLang = await page.evaluate(() => {
      return document.documentElement.getAttribute('lang') || 'not-set';
    });
    console.log(`   Default language: ${defaultLang}`);
    
    // Test 2: Language Selector Presence
    console.log('\n🔍 TEST 2: Language Selector Presence');
    const languageSelector = await page.$('[id*="language"]');
    console.log(`   Language selector found: ${languageSelector ? '✅ YES' : '❌ NO'}`);
    
    if (languageSelector) {
      // Test 3: Switch to Hebrew (RTL)
      console.log('\n🔍 TEST 3: Hebrew (RTL) Language Switch');
      await page.click('[id*="language"]');
      await page.waitForTimeout(1000);
      
      const hebrewOption = await page.$('text=עברית');
      if (hebrewOption) {
        await hebrewOption.click();
        await page.waitForTimeout(2000);
        
        const direction = await page.evaluate(() => {
          return document.documentElement.getAttribute('dir');
        });
        
        const currentLang = await page.evaluate(() => {
          return document.documentElement.getAttribute('lang');
        });
        
        console.log(`   Hebrew selected - Language: ${currentLang}, Direction: ${direction}`);
        console.log(`   RTL applied: ${direction === 'rtl' ? '✅ YES' : '❌ NO'}`);
        
        // Check for Hebrew text in UI
        const hebrewText = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('*'));
          return elements.some(el => /[\u0590-\u05FF]/.test(el.textContent));
        });
        console.log(`   Hebrew text visible: ${hebrewText ? '✅ YES' : '❌ NO'}`);
        
      } else {
        console.log('   ❌ Hebrew option not found in selector');
      }
      
      // Test 4: Switch to French (LTR)
      console.log('\n🔍 TEST 4: French (LTR) Language Switch');
      await page.click('[id*="language"]');
      await page.waitForTimeout(1000);
      
      const frenchOption = await page.$('text=Français');
      if (frenchOption) {
        await frenchOption.click();
        await page.waitForTimeout(2000);
        
        const direction = await page.evaluate(() => {
          return document.documentElement.getAttribute('dir');
        });
        
        const currentLang = await page.evaluate(() => {
          return document.documentElement.getAttribute('lang');
        });
        
        console.log(`   French selected - Language: ${currentLang}, Direction: ${direction}`);
        console.log(`   LTR applied: ${direction === 'ltr' ? '✅ YES' : '❌ NO'}`);
        
        // Check for French text in UI
        const frenchText = await page.evaluate(() => {
          const text = document.body.textContent;
          return /\b(Accueil|Connexion|Français|Bienvenue)\b/.test(text);
        });
        console.log(`   French text visible: ${frenchText ? '✅ YES' : '❌ NO'}`);
        
      } else {
        console.log('   ❌ French option not found in selector');
      }
      
      // Test 5: Switch to English (LTR)
      console.log('\n🔍 TEST 5: English (LTR) Language Switch');
      await page.click('[id*="language"]');
      await page.waitForTimeout(1000);
      
      const englishOption = await page.$('text=English');
      if (englishOption) {
        await englishOption.click();
        await page.waitForTimeout(2000);
        
        const direction = await page.evaluate(() => {
          return document.documentElement.getAttribute('dir');
        });
        
        const currentLang = await page.evaluate(() => {
          return document.documentElement.getAttribute('lang');
        });
        
        console.log(`   English selected - Language: ${currentLang}, Direction: ${direction}`);
        console.log(`   LTR applied: ${direction === 'ltr' ? '✅ YES' : '❌ NO'}`);
        
        // Check for English text in UI
        const englishText = await page.evaluate(() => {
          const text = document.body.textContent;
          return /\b(Home|Login|English|Welcome)\b/.test(text);
        });
        console.log(`   English text visible: ${englishText ? '✅ YES' : '❌ NO'}`);
        
      } else {
        console.log('   ❌ English option not found in selector');
      }
    }
    
    // Test 6: Translation Key Coverage
    console.log('\n🔍 TEST 6: Translation Key Coverage Check');
    
    const missingTranslations = await page.evaluate(() => {
      // Look for untranslated keys (appear as-is in the UI)
      const allText = document.body.textContent;
      const suspiciousKeys = [
        'appName', 'welcomeMessage', 'selectNumbers', 'currentJackpot',
        'login', 'logout', 'dashboard', 'chat', 'admin'
      ];
      
      const found = suspiciousKeys.filter(key => allText.includes(key));
      return found;
    });
    
    if (missingTranslations.length === 0) {
      console.log('   ✅ No obvious untranslated keys found');
    } else {
      console.log(`   ❌ Potential untranslated keys: ${missingTranslations.join(', ')}`);
    }
    
    // Test 7: Layout Adaptation for RTL/LTR
    console.log('\n🔍 TEST 7: Layout Adaptation Test');
    
    // Switch to Hebrew for RTL test
    await page.click('[id*="language"]');
    await page.waitForTimeout(500);
    const hebrewOption2 = await page.$('text=עברית');
    if (hebrewOption2) {
      await hebrewOption2.click();
      await page.waitForTimeout(1000);
      
      const rtlClasses = await page.evaluate(() => {
        return {
          hasRtlClass: document.documentElement.classList.contains('rtl'),
          hasLangHe: document.documentElement.classList.contains('lang-he'),
          dirAttribute: document.documentElement.getAttribute('dir')
        };
      });
      
      console.log(`   RTL class applied: ${rtlClasses.hasRtlClass ? '✅ YES' : '❌ NO'}`);
      console.log(`   Hebrew lang class: ${rtlClasses.hasLangHe ? '✅ YES' : '❌ NO'}`);
      console.log(`   Dir attribute: ${rtlClasses.dirAttribute}`);
    }
    
    console.log('\n🎯 Multilingual UI Test Summary:');
    console.log('   - Language selector functionality: Tested');
    console.log('   - RTL/LTR direction switching: Tested');
    console.log('   - Translation content loading: Tested');
    console.log('   - Layout adaptation: Tested');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  testMultilingualUI().catch(console.error);
}

module.exports = { testMultilingualUI };