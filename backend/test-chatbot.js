/**
 * Chatbot Test Script
 * 
 * Chatbot sistemini hızlıca test etmek için basit script.
 * 
 * Kullanım:
 *   node test-chatbot.js
 */

const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const API_URL = 'http://localhost:3001';

async function testChatbot() {
  console.log('🤖 Chatbot Test Başlıyor...\n');

  // Test 1: Basit Mesaj
  console.log('📝 Test 1: Basit Mesaj');
  await sendMessage('Merhaba, nasılsın?');
  console.log('✅ Test 1 Tamamlandı\n');

  // Test 2: Hizmet Listesi
  console.log('📝 Test 2: Hizmet Listesi');
  await sendMessage('Hangi hizmetleriniz var?');
  console.log('✅ Test 2 Tamamlandı\n');

  // Test 3: Hizmet Detayı
  console.log('📝 Test 3: Hizmet Detayı');
  await sendMessage('Kişisel antrenman hakkında bilgi verir misin?');
  console.log('✅ Test 3 Tamamlandı\n');

  // Test 4: SSS
  console.log('📝 Test 4: SSS');
  await sendMessage('Çalışma saatleriniz nedir?');
  console.log('✅ Test 4 Tamamlandı\n');

  // Test 5: Randevu Sorgusu
  console.log('📝 Test 5: Randevu Sorgusu');
  await sendMessage('Yarın saat 14:00 için randevu alabilir miyim?');
  console.log('✅ Test 5 Tamamlandı\n');

  // Test 6: Conversations Listesi
  console.log('📝 Test 6: Conversations Listesi');
  await getConversations();
  console.log('✅ Test 6 Tamamlandı\n');

  console.log('🎉 Tüm Testler Tamamlandı!');
}

async function sendMessage(message) {
  const sessionId = `test-session-${Date.now()}`;

  console.log(`   Mesaj: "${message}"`);
  console.log('   Yanıt: ', { newline: false });

  try {
    const response = await fetch(`${API_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenant_id: TEST_TENANT_ID,
        session_id: sessionId,
        message: message,
        customer_info: {
          name: 'Test User',
          email: 'test@example.com',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Read streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.chunk) {
            process.stdout.write(data.chunk);
            fullResponse += data.chunk;
          }
        }
      }
    }

    console.log('\n');
    return fullResponse;
  } catch (error) {
    console.error(`\n   ❌ Hata: ${error.message}\n`);
    throw error;
  }
}

async function getConversations() {
  try {
    const response = await fetch(
      `${API_URL}/api/chat/conversations?tenant_id=${TEST_TENANT_ID}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`   Toplam Conversation: ${data.conversations.length}`);

    if (data.conversations.length > 0) {
      const latest = data.conversations[0];
      console.log(`   Son Conversation:`);
      console.log(`     - ID: ${latest.id}`);
      console.log(`     - Session: ${latest.session_id}`);
      console.log(`     - Mesaj Sayısı: ${latest.message_count}`);
      console.log(`     - Durum: ${latest.status}`);
    }
  } catch (error) {
    console.error(`   ❌ Hata: ${error.message}`);
    throw error;
  }
}

// Run tests
testChatbot().catch((error) => {
  console.error('\n❌ Test Başarısız:', error.message);
  process.exit(1);
});
