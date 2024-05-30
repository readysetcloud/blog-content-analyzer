import frontmatter from '@github-docs/frontmatter';
import { markdownToTxt } from 'markdown-to-txt';
import { getOctokit } from './utils/helpers.mjs';
import wordCount from 'word-count';

export const handler = async (state) => {
  let { content } = state;
  if (!content) {
    content = await loadContentFromGitHub(state.fileName);
  }

  const post = frontmatter(content);
  const plainText = markdownToTxt(post.content);
  return {
    metadata: post.data,
    text: plainText,
    markdown: post.content,
    wordCount: wordCount(plainText)
  };
};

const loadContentFromGitHub = async (fileName) => {
  const octokit = await getOctokit();
  const content = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: process.env.OWNER,
    repo: process.env.REPO,
    path: fileName
  });

  const buffer = Buffer.from(content.data.content, 'base64');
  const data = buffer.toString('utf8');

  return data;
};
