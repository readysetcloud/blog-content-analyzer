const { Octokit } = require('@octokit/rest');
const frontmatter = require('@github-docs/frontmatter');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secrets = new SecretsManagerClient();
let octokit;

exports.handler = async (state) => {
  const metadata = { ...state.originalMetadata, metadata: state.newMetadata, audio: state.audio, ogDescription: state.description };
  const content = frontmatter.stringify(state.markdown, metadata);

  try {
    await setupOctokit();
    const { data: { sha } } = await octokit.repos.getContent({
      owner: process.env.OWNER,
      repo: process.env.REPO,
      path: state.fileName,
    });

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.OWNER,
      repo: process.env.REPO,
      path: state.fileName,
      message: `[analysis] Adding analysis and audio to ${state.fileName}`,
      content: Buffer.from(content).toString("base64"),
      sha
    });
  } catch (err) {
    console.error({ error: err.message });
    console.error(err);
    return { success: false };
  }

  return { success: true };
}

const getSecret = async (secretKey) => {
  const secretResponse = await secrets.send(new GetSecretValueCommand({ SecretId: process.env.SECRET_ID }));
  if (secretResponse) {
    cachedSecrets = JSON.parse(secretResponse.SecretString);
    return cachedSecrets[secretKey];
  }
};

const setupOctokit = async () => {
  if (!octokit) {
    const gitHubSecret = await getSecret('github');
    octokit = new Octokit({ auth: gitHubSecret });
  }
};