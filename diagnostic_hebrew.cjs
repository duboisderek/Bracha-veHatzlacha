// Diagnostic spécifique pour les fonctionnalités hébreu
const fs = require('fs');
const path = require('path');

console.log('=== DIAGNOSTIC PAGES HÉBREU ===\n');

// 1. Vérifier les traductions hébreu spécifiques
function checkHebrewTranslations() {
    console.log('1. VÉRIFICATION TRADUCTIONS HÉBREU');
    
    try {
        const i18nPath = path.join(__dirname, 'client/src/lib/i18n_final.ts');
        const content = fs.readFileSync(i18nPath, 'utf8');
        
        // Extraire la section hébreu
        const hebrewSection = content.match(/he:\s*{([\s\S]*?)},\s*fr:/);
        if (!hebrewSection) {
            console.log('❌ Section hébreu non trouvée dans i18n_final.ts');
            return false;
        }
        
        const hebrewContent = hebrewSection[1];
        
        // Vérifier les clés critiques pour la fonctionnalité
        const criticalKeys = [
            'appName',
            'home', 
            'login',
            'selectNumbers',
            'currentBalance',
            'nextDraw',
            'participationAmount',
            'clientLogin',
            'reuseNumbers'
        ];
        
        let missingKeys = [];
        criticalKeys.forEach(key => {
            if (!hebrewContent.includes(`${key}:`)) {
                missingKeys.push(key);
            }
        });
        
        if (missingKeys.length > 0) {
            console.log('❌ Clés manquantes en hébreu:', missingKeys);
            return false;
        }
        
        console.log('✅ Toutes les clés critiques présentes en hébreu');
        return true;
        
    } catch (error) {
        console.log('❌ Erreur lecture fichier i18n:', error.message);
        return false;
    }
}

// 2. Vérifier le support RTL dans les composants
function checkRTLSupport() {
    console.log('\n2. VÉRIFICATION SUPPORT RTL');
    
    try {
        const contextPath = path.join(__dirname, 'client/src/contexts/LanguageContext.tsx');
        const content = fs.readFileSync(contextPath, 'utf8');
        
        // Vérifier la logique RTL
        const hasRTLLogic = content.includes("isRTL = language === 'he'") || 
                           content.includes("dir', isRTL ? 'rtl' : 'ltr'");
        
        if (!hasRTLLogic) {
            console.log('❌ Logique RTL manquante dans LanguageContext');
            return false;
        }
        
        // Vérifier l'application DOM
        const hasDOMApplication = content.includes("document.documentElement.setAttribute('dir'");
        
        if (!hasDOMApplication) {
            console.log('❌ Application DOM RTL manquante');
            return false;
        }
        
        console.log('✅ Support RTL correctement implémenté');
        return true;
        
    } catch (error) {
        console.log('❌ Erreur vérification RTL:', error.message);
        return false;
    }
}

// 3. Vérifier les erreurs TypeScript qui affectent le rendu
function checkTypeScriptErrors() {
    console.log('\n3. VÉRIFICATION ERREURS TYPESCRIPT');
    
    const errorFiles = [
        'client/src/pages/Home.tsx',
        'client/src/components/layout/Header.tsx'
    ];
    
    let hasErrors = false;
    
    errorFiles.forEach(filePath => {
        try {
            const fullPath = path.join(__dirname, filePath);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Chercher des patterns d'erreur TypeScript
                const errorPatterns = [
                    /Type.*unknown.*not assignable/,
                    /Property.*does not exist on type/,
                    /possibly.*null/
                ];
                
                let fileHasErrors = false;
                errorPatterns.forEach(pattern => {
                    if (pattern.test(content)) {
                        fileHasErrors = true;
                        hasErrors = true;
                    }
                });
                
                if (fileHasErrors) {
                    console.log(`❌ Erreurs TypeScript détectées dans ${filePath}`);
                } else {
                    console.log(`✅ ${filePath} semble correct`);
                }
            }
        } catch (error) {
            console.log(`❌ Erreur lecture ${filePath}:`, error.message);
            hasErrors = true;
        }
    });
    
    return !hasErrors;
}

// 4. Vérifier les clés de traduction utilisées vs définies
function checkTranslationUsage() {
    console.log('\n4. VÉRIFICATION USAGE TRADUCTIONS');
    
    try {
        // Lire les composants principaux
        const homePath = path.join(__dirname, 'client/src/pages/Home.tsx');
        const headerPath = path.join(__dirname, 'client/src/components/layout/Header.tsx');
        
        const homeContent = fs.readFileSync(homePath, 'utf8');
        const headerContent = fs.readFileSync(headerPath, 'utf8');
        
        // Extraire les clés utilisées avec t()
        const usedKeys = [];
        const tCallPattern = /t\(["']([^"']+)["']\)/g;
        
        let match;
        while ((match = tCallPattern.exec(homeContent)) !== null) {
            usedKeys.push(match[1]);
        }
        while ((match = tCallPattern.exec(headerContent)) !== null) {
            usedKeys.push(match[1]);
        }
        
        // Vérifier si toutes les clés utilisées existent en hébreu
        const i18nPath = path.join(__dirname, 'client/src/lib/i18n_final.ts');
        const i18nContent = fs.readFileSync(i18nPath, 'utf8');
        
        const hebrewSection = i18nContent.match(/he:\s*{([\s\S]*?)},\s*fr:/);
        if (!hebrewSection) {
            console.log('❌ Section hébreu introuvable');
            return false;
        }
        
        const hebrewContent = hebrewSection[1];
        let missingInHebrew = [];
        
        usedKeys.forEach(key => {
            if (!hebrewContent.includes(`${key}:`)) {
                missingInHebrew.push(key);
            }
        });
        
        if (missingInHebrew.length > 0) {
            console.log('❌ Clés utilisées mais manquantes en hébreu:', missingInHebrew);
            return false;
        }
        
        console.log('✅ Toutes les clés utilisées sont définies en hébreu');
        console.log(`   Nombre de clés vérifiées: ${usedKeys.length}`);
        return true;
        
    } catch (error) {
        console.log('❌ Erreur vérification usage:', error.message);
        return false;
    }
}

// 5. Vérifier les styles RTL
function checkRTLStyles() {
    console.log('\n5. VÉRIFICATION STYLES RTL');
    
    try {
        const cssPath = path.join(__dirname, 'client/src/index.css');
        if (fs.existsSync(cssPath)) {
            const content = fs.readFileSync(cssPath, 'utf8');
            
            // Chercher des règles RTL
            const hasRTLStyles = content.includes('[dir="rtl"]') || 
                               content.includes('.rtl') ||
                               content.includes('html[dir="rtl"]');
            
            if (hasRTLStyles) {
                console.log('✅ Styles RTL trouvés dans index.css');
                return true;
            } else {
                console.log('⚠️  Aucun style RTL spécifique trouvé');
                return false;
            }
        } else {
            console.log('❌ Fichier index.css non trouvé');
            return false;
        }
    } catch (error) {
        console.log('❌ Erreur vérification styles RTL:', error.message);
        return false;
    }
}

// Exécuter tous les diagnostics
async function runDiagnostics() {
    const results = {
        translations: checkHebrewTranslations(),
        rtlSupport: checkRTLSupport(),
        typeScriptErrors: checkTypeScriptErrors(),
        translationUsage: checkTranslationUsage(),
        rtlStyles: checkRTLStyles()
    };
    
    console.log('\n=== RÉSUMÉ DIAGNOSTIC ===');
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    console.log(`Résultat: ${passed}/${total} vérifications passées`);
    
    if (passed === total) {
        console.log('✅ TOUTES LES VÉRIFICATIONS PASSÉES - Pages hébreu fonctionnelles');
    } else {
        console.log('❌ PROBLÈMES DÉTECTÉS - Pages hébreu partiellement fonctionnelles');
        
        Object.entries(results).forEach(([test, passed]) => {
            if (!passed) {
                console.log(`   - ${test}: ÉCHEC`);
            }
        });
    }
    
    return results;
}

// Exécuter le diagnostic
runDiagnostics().catch(console.error);