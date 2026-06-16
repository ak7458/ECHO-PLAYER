const CryptoJS = require('crypto-js');

function decryptUrl(encryptedUrl) {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
        { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
        key,
        {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
}

const url = "ID2ieOjCrwfgWvL5sXl4B1ImC5QfbsDy6UWMvucrWHxfIRjtvw8g35/f89z5MoGc71/Y9eRN3bK0jKAAHF631xw7tS9a8Gtq";
const decrypted = decryptUrl(url);
console.log('Decrypted URL:', decrypted);

// Check if URL works
const https = require('https');
https.get(decrypted, (res) => {
    console.log('Status code:', res.statusCode);
}).on('error', (e) => {
    console.error('Request failed:', e);
});
