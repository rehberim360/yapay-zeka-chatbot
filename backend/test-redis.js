// Quick Redis Test
// Using native fetch (Node 18+)

async function testRedis() {
  console.log('🧪 Redis Test Başlıyor...\n');
  
  try {
    // Test 1: Health check
    console.log('📝 Test 1: Health Check');
    const healthRes = await fetch('http://localhost:3001/health');
    const health = await healthRes.json();
    console.log('   Status:', health.status);
    console.log('   ✅ Health check başarılı\n');
    
    // Test 2: Simple chat
    console.log('📝 Test 2: Simple Chat');
    const chatRes = await fetch('http://localhost:3001/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: '00000000-0000-0000-0000-000000000001',
        session_id: 'test-redis-' + Date.now(),
        message: 'Merhaba',
      }),
    });
    
    console.log('   Status Code:', chatRes.status);
    
    if (chatRes.status === 200) {
      console.log('   ✅ Chat başarılı\n');
    } else {
      const error = await chatRes.text();
      console.log('   ❌ Hata:', error, '\n');
    }
    
    console.log('🎉 Test Tamamlandı!');
  } catch (error) {
    console.error('❌ Test Başarısız:', error.message);
  }
}

testRedis();
