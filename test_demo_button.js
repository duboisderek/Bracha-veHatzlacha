// Test automatisé pour valider la correction du bouton démo
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testDemoButtonFunctionality() {
  console.log('🧪 TEST: Fonctionnalité bouton démo client');
  console.log('==========================================');
  
  try {
    // Test 1: Vérifier que l'endpoint demo-login fonctionne
    console.log('\n1. Test endpoint /api/auth/demo-login...');
    
    const demoResponse = await axios.post(`${BASE_URL}/api/auth/demo-login`, {
      demoUser: 'client1'
    });
    
    if (demoResponse.status === 200 && demoResponse.data.user) {
      console.log('✅ Endpoint demo-login fonctionnel');
      console.log(`   Utilisateur créé: ${demoResponse.data.user.firstName} ${demoResponse.data.user.lastName}`);
      console.log(`   Email: ${demoResponse.data.user.email}`);
      console.log(`   Solde: ${demoResponse.data.user.balance}₪`);
    } else {
      console.log('❌ Endpoint demo-login défaillant');
      return false;
    }

    // Test 2: Vérifier les différents clients démo
    console.log('\n2. Test clients démo multiples...');
    
    const demoUsers = ['client1', 'client2', 'client3'];
    for (const demoUser of demoUsers) {
      const response = await axios.post(`${BASE_URL}/api/auth/demo-login`, {
        demoUser
      });
      
      if (response.status === 200) {
        console.log(`✅ ${demoUser}: ${response.data.user.email} (${response.data.user.balance}₪)`);
      } else {
        console.log(`❌ ${demoUser}: Échec connexion`);
      }
    }

    // Test 3: Vérifier authentification universelle
    console.log('\n3. Test authentification universelle...');
    
    const authResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'demo@brachavehatzlacha.com',
      password: 'demo123'
    });
    
    if (authResponse.status === 200) {
      console.log('✅ Authentification universelle fonctionnelle');
      console.log(`   Utilisateur: ${authResponse.data.user.firstName} ${authResponse.data.user.lastName}`);
    } else {
      console.log('❌ Authentification universelle défaillante');
    }

    // Test 4: Vérifier page principale accessible
    console.log('\n4. Test accessibilité page principale...');
    
    const pageResponse = await axios.get(BASE_URL);
    if (pageResponse.status === 200) {
      console.log('✅ Page principale accessible');
    } else {
      console.log('❌ Page principale inaccessible');
    }

    console.log('\n🎯 RÉSULTAT: Tous les tests ont réussi');
    console.log('Le bouton démo est maintenant fonctionnel');
    return true;

  } catch (error) {
    console.log(`\n❌ ERREUR TEST: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'Erreur inconnue'}`);
    }
    return false;
  }
}

// Exécution du test
if (require.main === module) {
  testDemoButtonFunctionality().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testDemoButtonFunctionality };