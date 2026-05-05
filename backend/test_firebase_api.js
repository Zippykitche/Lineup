import axios from 'axios';

const FIREBASE_API_KEY = 'AIzaSyDePD9pELsholnhJ5PXStAyXNArsa_Kt3w';
const email = 'superadmin@kbc.co.ke';
const password = 'WrongPassword123';

async function testFirebaseRestApi() {
  const loginUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
  
  console.log(`Testing Firebase REST API with WRONG password for ${email}...`);
  
  try {
    const response = await axios.post(loginUrl, {
      email,
      password,
      returnSecureToken: true
    });
    console.log('❌ SUCCESS (This is bad!):', response.data);
  } catch (error) {
    if (error.response) {
      console.log('✅ FAILED as expected:', error.response.status, error.response.data.error.message);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testFirebaseRestApi();
