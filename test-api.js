
// Test script para verificar la API
async function testAPI() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    // Test 1: Get all customers (should return empty array initially)
    console.log('Testing GET /api/customers...');
    const getResponse = await fetch(`${baseUrl}/api/customers`);
    const customers = await getResponse.json();
    console.log('Customers:', customers);
    
    // Test 2: Create a new customer
    console.log('Testing POST /api/customers...');
    const postResponse = await fetch(`${baseUrl}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Cliente de Prueba',
        email_contacto: 'prueba@ejemplo.com'
      })
    });
    
    if (postResponse.ok) {
      const newCustomer = await postResponse.json();
      console.log('New customer created:', newCustomer);
    } else {
      console.error('Error creating customer:', await postResponse.text());
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAPI();
