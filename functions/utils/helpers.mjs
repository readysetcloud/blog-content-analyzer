import { getSecret } from '@aws-lambda-powertools/parameters/secrets';
import { Octokit } from 'octokit';

let octokit;

export const getOctokit = async () => {
  if (!octokit) {
    const secrets = await getSecret(process.env.SECRET_ID, { transform: 'json' });
    octokit = new Octokit({ auth: secrets.github });
  }

  return octokit;
};
