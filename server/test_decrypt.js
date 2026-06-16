const crypto = require('crypto');
function decryptUrl(encryptedUrl) {
    const key = Buffer.from('38346591');
    const decipher = crypto.createDecipheriv('des-ecb', key, '');
    let decrypted = decipher.update(encryptedUrl, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
const url = decryptUrl("ID2ieOjCrwfgWvL5sXl4B1ImC5QfbsDy6UWMvucrWHxfIRjtvw8g35/f89z5MoGc71/Y9eRN3bK0jKAAHF631xw7tS9a8Gtq");
console.log(url);
