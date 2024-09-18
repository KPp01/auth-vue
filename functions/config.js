const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const [version] = await client.accessSecretVersion({
    name: `projects/auth-vue-bf3ca/secrets/${secretName}/versions/latest`,
  });

  const payload = version.payload.data.toString('utf8');
  return JSON.parse(payload);
}

module.exports = { getSecret };
