const frontmatter = require('@github-docs/frontmatter');
const { markdownToTxt } = require('markdown-to-txt');

exports.handler = async (state) => {
  const post = frontmatter(state.content);
  const plainText = markdownToTxt(post.content);
  return {
    metadata: post.data,
    text: plainText,
    markdown: post.content
  };
};