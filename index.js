const express = require('express')
const crypto = require('crypto')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.json({msg: "HELLO"})
})

function convertToPEM(privateKeyString) {
    const header = '-----BEGIN PRIVATE KEY-----\n';
    const footer = '\n-----END PRIVATE KEY-----\n';
    let formattedKey = header;

    // Ensure the private key string doesn't already have PEM headers/footers
    const trimmedKey = privateKeyString.trim()
        .replace(/^-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----$/, '');

    // Split the key into lines of 64 characters and concatenate with newline
    for (let i = 0; i < trimmedKey.length; i += 64) {
        formattedKey += trimmedKey.slice(i, i + 64) + '\n';
    }

    formattedKey += footer;

    console.log("formattedKey : ", formattedKey);

    return formattedKey;
}

app.post('/request-payload', (req, res) => {

    // Your payload (message) to be signed
    const merchantId = "4433035817"
    const posId = "8400724730"
    const method = "POST"
    const requestType = `/pos/${posId}/topup/`
    const requestBody = "{amount:10,destId:971501234567}"
    const secret = "AZRAMNP102022"
    const timestamp = "2024-03-03T12:02:45.530-0500"
    const payload = `${method}${requestType}${requestBody}secretWord=${secret}api-request-merchantid${merchantId}api-request-timestamp${timestamp}`;

    console.log("MAIN PAYLOAD : ", payload);
    // Load your private key (replace 'your-private-key.pem' with the path to your private key file)
    const privateKey = "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAInoTEOA01QF8dAps8CDhzKSHFQfi84koVoF3lbVFp2iOyGTZ8Nc1DvC9typoFPrkuUw05ojB9gH6BB7xgIU3vpyQ+W8xHBgRxKg6V7LxAjtMPudflZ3CFbE/npkl/mLiKMvj2vLo9DXYBIHVqDrWIQb1Ba0dYJfduKQKn9xkjXZAgMBAAECgYAXacNs4HXAeaPkwfe9EveEm+7IT3TGYkysgnuNhW7qA02DtUl0DxIPNVoA+6F3LfMKC0CZliHySOFazxC+cLmsS8lX1HF1/DnrIBzrD4ifdSL6NkXlsNtTnhiwRIniCfSHvx8IK96ISBEhs2Cpp80M5Wtarh09bjVRN8qWP3FkyQJBAP08lqfxWk6locqpgpi5PbmYao8/c/NXZm7PH8xmSQVZPGSwtJHMsnrryJ9ErKjqrPIL/+6efyjYFO5LmvTgsR0CQQCLaYoaJO2DQi3TMyrL2LGZWdajUwd+gJ9QtqgF7YyW1Hf/wl/dx7MeMjxZZOLdvaDOo/+XxJfwarP5ygvXgNbtAkEAqf9xd55rLF6+ZQk0NYgtKplp9232TcY/amW7CAEmRePoygNhxHqw2hnMnTaB3gdkQDzT+4EFBgtAydORW5A29QJAZjlaGXeQbRm+rkmrjNN0zoRwfUvph9nad/2nUMlxuDtNTk2BrAa9kVu2orn2HC/q1Pqt9OQjoRcspvF/I2MGtQJAewL0i9kjQbo2t2ouanbrmRiMVXnJVFxm/XLWMIClztXJJlQgdzlHF+UGU8Pcw65mCETj5i2HXbXpwVreXMfsbA==";
    console.log(crypto.randomBytes(32));
    const pem = convertToPEM(privateKey);
    console.log(pem);

    // Step 1: Hash the payload using SHA256
    const hash = crypto.createHash('sha256').update(payload).digest();
    console.log("HASH : ", hash);
    // Step 2: Encrypt the hash using AES with a symmetric key derived from the private key
    const key = crypto.createPrivateKey(privateKey);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16)); // Use AES-256-CBC for example
    let encrypted = cipher.update(hash);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Step 3: Encode the encrypted hash as a string (for example, using Base64)
    const signature = encrypted.toString('base64');

    console.log('Payload Signature:', signature);
    res.status(200).json({
        signature: 'PAYLOAD SIGNATURE HERE'
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})