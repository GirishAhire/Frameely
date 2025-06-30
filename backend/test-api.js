import fetch from 'node-fetch';

// Simple script to test the admin API directly
async function testAdminAPI() {
  try {
    console.log('🔍 Testing Admin API directly...');
    
    // Test 1: Admin Login
    console.log('\n📝 Test 1: Admin Login');
    const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@frameely.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login Status:', loginResponse.status);
    console.log('Login Response:', loginData);
    
    if (!loginData.token) {
      console.log('❌ Login failed - No token received');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Login successful, token received');
    
    // Test 2: Get Orders
    console.log('\n📝 Test 2: Get Orders');
    const ordersResponse = await fetch('http://localhost:5000/api/admin/orders?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const ordersData = await ordersResponse.json();
    console.log('Orders Status:', ordersResponse.status);
    console.log('Orders Count:', ordersData.data ? ordersData.data.length : 0);
    console.log('Orders Response Sample:', ordersData.data && ordersData.data.length > 0 ? 
      ordersData.data[0] : 'No orders found');
    
    // Test 3: Get Dashboard
    console.log('\n📝 Test 3: Get Dashboard');
    const dashboardResponse = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard Status:', dashboardResponse.status);
    console.log('Dashboard Data:', dashboardData);
    
    console.log('\n✅ API Tests Completed');
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testAdminAPI(); 