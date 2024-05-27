import { Octokit } from '@octokit/rest';
import frontmatter from '@github-docs/frontmatter';
import { getSecret } from '@aws-lambda-powertools/parameters/secrets';

let octokit;

export const handler = async (state) => {
  const shouldCommit = process.env.SHOULD_COMMIT || 'false';
  if(!shouldCommit) return { success: true };

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
};

const setupOctokit = async () => {
  if (!octokit) {
    const secrets = await getSecret(process.env.SECRET_ID, { transform: 'json' });
    octokit = new Octokit({ auth: secrets.github });
  }
};
