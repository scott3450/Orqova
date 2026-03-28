const sdk = require('node-appwrite');

// Appwrite İstemci (Client) Ayarları
const client = new sdk.Client();
client
    .setEndpoint('https://[YOUR_APPWRITE_ENDPOINT]/v1') // Appwrite Endpoint'iniz
    .setProject('[YOUR_PROJECT_ID]')                   // Proje ID'niz
    .setKey('[YOUR_API_KEY]');                         // n8n veya admin API anahtarınız (Tam Yetkili)

const databases = new sdk.Databases(client);

// Önceden oluşturduğunuz veya burada oluşturacağınız Database ID'niz
const databaseId = '[YOUR_DATABASE_ID]'; 

async function setupAppwriteCollections() {
    try {
        console.log('--- Shops Koleksiyonu Kurulumu ---');
        try {
            await databases.createCollection(databaseId, 'shops', 'Shops', [
                sdk.Permission.read(sdk.Role.any()), // Güvenlik modelinize göre güncelleyebilirsiniz
            ]);
            console.log('Shops koleksiyonu oluşturuldu.');
        } catch (e) { console.log('Shops koleksiyonu zaten var olabilir.'); }

        // Özellikleri ekle
        await databases.createStringAttribute(databaseId, 'shops', 'shopId', 255, true);
        await databases.createStringAttribute(databaseId, 'shops', 'name', 255, true);
        await databases.createStringAttribute(databaseId, 'shops', 'gCalId', 255, false);
        await databases.createBooleanAttribute(databaseId, 'shops', 'isActive', true);
        
        // Appwrite'ın özellikleri oluşturması için biraz bekliyoruz (async olduğu için)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Unique index for shopId
        await databases.createIndex(databaseId, 'shops', 'idx_shopId_unique', 'unique', ['shopId'], ['ASC']);
        console.log('Shops özellikleri ve indeksleri eklendi.');


        console.log('\n--- Appointments Koleksiyonu Kurulumu ---');
        try {
            await databases.createCollection(databaseId, 'appointments', 'Appointments');
            console.log('Appointments koleksiyonu oluşturuldu.');
        } catch (e) { console.log('Appointments koleksiyonu zaten var olabilir.'); }

        // Özellikleri ekle
        await databases.createStringAttribute(databaseId, 'appointments', 'appointmentId', 255, true);
        await databases.createStringAttribute(databaseId, 'appointments', 'shopId', 255, true);
        await databases.createStringAttribute(databaseId, 'appointments', 'customerPhone', 255, true);
        await databases.createDatetimeAttribute(databaseId, 'appointments', 'startTime', true);
        await databases.createDatetimeAttribute(databaseId, 'appointments', 'endTime', true);
        await databases.createStringAttribute(databaseId, 'appointments', 'gCalEventId', 255, false);
        await databases.createStringAttribute(databaseId, 'appointments', 'status', 255, true); // pending, confirmed, cancelled

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Index for shopId (Sorgulama yapılacak)
        await databases.createIndex(databaseId, 'appointments', 'idx_shopId', 'key', ['shopId'], ['ASC']);
        console.log('Appointments özellikleri ve indeksleri eklendi.');


        console.log('\n--- Logs Koleksiyonu Kurulumu ---');
        try {
            await databases.createCollection(databaseId, 'logs', 'Logs');
            console.log('Logs koleksiyonu oluşturuldu.');
        } catch (e) { console.log('Logs koleksiyonu zaten var olabilir.'); }

        // Özellikleri ekle
        await databases.createStringAttribute(databaseId, 'logs', 'shopId', 255, true);
        await databases.createDatetimeAttribute(databaseId, 'logs', 'timestamp', true);
        await databases.createStringAttribute(databaseId, 'logs', 'status', 255, true); // success, error
        await databases.createStringAttribute(databaseId, 'logs', 'message', 500, false);

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Index for shopId
        await databases.createIndex(databaseId, 'logs', 'idx_shopId', 'key', ['shopId'], ['ASC']);
        console.log('Logs özellikleri ve indeksleri eklendi.');

        console.log('\n✅ Appwrite Database Şeması Başarıyla Kuruldu!');
        console.log('NOT: Kullanacağınız API Key n8n üzerinde tam yetkiye sahip olmalıdır (scopes: databases.read, databases.write, collections.read, collections.write vb.)');

    } catch (error) {
        console.error('Kurulum sırasında hata oluştu:', error);
    }
}

setupAppwriteCollections();
