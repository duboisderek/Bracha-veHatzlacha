// Script de test d'authentification pour tous les rôles
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Comptes de test
const accounts = {
  adminPrincipal: {
    email: 'admin@brachavehatzlacha.com',
    password: 'admin123',
    expectedRole: 'admin',
    expectedLanguage: 'he'
  },
  adminEnglish: {
    email: 'admin@lotopro.com', 
    password: 'admin123',
    expectedRole: 'admin',
    expectedLanguage: 'en'
  },
  clientDemo: {
    email: 'demo@brachavehatzlacha.com',
    password: 'demo123',
    expectedRole: 'demo',
    expectedLanguage: 'he'
  },
  clientHebrew: {
    email: 'client8hxb9u@brachavehatzlacha.com',
    password: 'client123',
    expectedRole: 'client',
    expectedLanguage: 'he'
  },
  clientEnglish: {
    email: 'test@complete.com',
    password: 'test123',
    expectedRole: 'client',
    expectedLanguage: 'en'
  }
};

async function testAuthentication(accountName, credentials) {
  try {
    console.log(`\n🔐 Test d'authentification: ${accountName}`);
    console.log(`Email: ${credentials.email}`);
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: credentials.email,
      password: credentials.password
    });

    if (response.status === 200 && response.data.user) {
      const user = response.data.user;
      console.log(`✅ Connexion réussie`);
      console.log(`ID: ${user.id}`);
      console.log(`Nom: ${user.firstName} ${user.lastName}`);
      console.log(`Admin: ${user.isAdmin ? 'Oui' : 'Non'}`);
      console.log(`Langue: ${user.language}`);
      console.log(`Solde: ${user.balance}₪`);
      console.log(`Bloqué: ${user.isBlocked ? 'Oui' : 'Non'}`);
      
      return {
        success: true,
        user: user,
        sessionCookie: response.headers['set-cookie']
      };
    } else {
      console.log(`❌ Échec de connexion`);
      return { success: false };
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAdminEndpoints(sessionCookie) {
  try {
    console.log(`\n🔧 Test endpoints admin...`);
    
    // Test accès liste utilisateurs (admin uniquement)
    const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    if (usersResponse.status === 200) {
      console.log(`✅ Accès liste utilisateurs: ${usersResponse.data.length} utilisateurs`);
    }
    
    // Test création utilisateur (admin uniquement)
    const newUserResponse = await axios.post(`${BASE_URL}/api/users`, {
      email: `test_${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+33612345678',
      language: 'en'
    }, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    if (newUserResponse.status === 201) {
      console.log(`✅ Création utilisateur réussie: ${newUserResponse.data.id}`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Erreur endpoints admin: ${error.response?.status} ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testClientEndpoints(sessionCookie) {
  try {
    console.log(`\n🎫 Test endpoints client...`);
    
    // Test accès tirage actuel
    const drawResponse = await axios.get(`${BASE_URL}/api/draws/current`, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    if (drawResponse.status === 200) {
      console.log(`✅ Accès tirage actuel: Tirage #${drawResponse.data.drawNumber}`);
    }
    
    // Test accès chat
    const chatResponse = await axios.get(`${BASE_URL}/api/chat/messages`, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    if (chatResponse.status === 200) {
      console.log(`✅ Accès chat: ${chatResponse.data.length} messages`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Erreur endpoints client: ${error.response?.status} ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 DÉBUT DES TESTS D\'AUTHENTIFICATION');
  console.log('=====================================');
  
  const results = {};
  
  for (const [accountName, credentials] of Object.entries(accounts)) {
    const authResult = await testAuthentication(accountName, credentials);
    results[accountName] = authResult;
    
    if (authResult.success) {
      const sessionCookie = authResult.sessionCookie?.[0];
      
      if (authResult.user.isAdmin) {
        const adminTest = await testAdminEndpoints(sessionCookie);
        results[accountName].adminAccess = adminTest;
      } else {
        const clientTest = await testClientEndpoints(sessionCookie);
        results[accountName].clientAccess = clientTest;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pause entre tests
  }
  
  console.log('\n📊 RÉSUMÉ DES TESTS');
  console.log('==================');
  
  Object.entries(results).forEach(([account, result]) => {
    if (result.success) {
      const role = result.user.isAdmin ? 'Admin' : 'Client';
      const accessTest = result.adminAccess !== undefined ? result.adminAccess : result.clientAccess;
      console.log(`✅ ${account}: ${role} - Accès ${accessTest ? 'OK' : 'Limité'}`);
    } else {
      console.log(`❌ ${account}: Échec connexion`);
    }
  });
  
  console.log('\n🎯 COMPTES PRÊTS POUR PRODUCTION');
  console.log('===============================');
  
  Object.entries(accounts).forEach(([name, creds]) => {
    const result = results[name];
    if (result.success) {
      console.log(`${name}:`);
      console.log(`  Email: ${creds.email}`);
      console.log(`  Password: ${creds.password}`);
      console.log(`  Rôle: ${result.user.isAdmin ? 'Administrateur' : 'Client'}`);
      console.log(`  Statut: ✅ Fonctionnel\n`);
    }
  });
}

// Exécution des tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testAuthentication, testAdminEndpoints, testClientEndpoints };