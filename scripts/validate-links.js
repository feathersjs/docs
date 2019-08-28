const fs = require('fs');
const path = require('path');
const engine = require('unified-engine');
const remark = require('remark');
const anchorValidator = require('remark-validate-links');
const reporter = require('vfile-reporter');

const REG_BLANK_OR_COMMENT = /^\s*(?:\s*|#.*)$/;
const REG_FILE_REDIRECT = /\.(?:html|jpg|png)$/;
const REG_WILD_REDIRECT = /\*$/;

// When the site is compiled, links to .md files are changed to .html
// We replace extensions with a dot so we can match redirects correctly.
const EXTENSION_REPLACEMENT = '.';

// Converts _redirects to a mapping of oldUrl -> newUrl
// This is the only sync operation in here...
const redirectsPath = path.resolve(__dirname, '../_redirects');
const redirects = fs.existsSync(redirectsPath) ? fs
    .readFileSync(redirectsPath, 'utf8')
    .split(/\n/)
    .filter(line => !REG_BLANK_OR_COMMENT.test(line))
    .reduce((obj, line) => {
      line = line.trim().split(/\s+/);
      return Object.assign(obj, { [line[0]]: line[1] });
    }, {}) : {};

// Mapping of file redirects
// Extensions are removed so that we can match URLs below
const fileRedirects = Object.keys(redirects)
  .filter(p => REG_FILE_REDIRECT.test(p))
  .reduce((obj, p) => Object.assign(obj, {
    [p.replace(REG_FILE_REDIRECT, EXTENSION_REPLACEMENT)]: redirects[p]
  }), {});

// Mapping of wildcard redirects
// Splats are removed so that we can match URLs below
const wildRedirects = Object.keys(redirects)
  .filter(p => REG_WILD_REDIRECT.test(p))
  .reduce((obj, p) => Object.assign(obj, {
    [p.replace(REG_WILD_REDIRECT, '')]: redirects[p]
  }), {});

function urlIsRedirect(file, url) {
  // Strip cwd and extension from fully resolved target path
  // This is important as the target path will now have
  //   1) an absolute path with leading slash (as is used by all redirects)
  //   2) a trailing dot to match file redirects (see fileRedirects above)
  const target = path
    .resolve(file.cwd, url)
    .replace(file.cwd, '')
    .replace(path.extname(url), EXTENSION_REPLACEMENT);

  // First test against wildcards
  const wildCard = Object.keys(wildRedirects).find(w => target.indexOf(w) === 0);
  if(wildCard) {
    // console.log('WILDCARD REDIRECT:', target);
    return true;
  }

  // Next test against file redirects
  const redirect = Object.keys(fileRedirects).find(r =>  target.indexOf(r) === 0);
  if(redirect) {
    // console.log('FILE REDIRECT:', target);
    return true;
  }

  // console.log('NOT FOUND:', target);
  return false;
}

function validateRedirects(vfiles) {
  return vfiles.map(file => {
    if(!file.messages || !file.messages.length) {
      return file;
    }

    // All link errors will be listed in the "messages" property.
    // For any "missing-file" errors, check to see if a redirect
    // has been defined for that file. If so, ignore the message.
    file.messages = file.messages
      .filter(message => {
        if(message.ruleId === 'missing-file') {
          // Extract url from "reason" string. This is the only
          // sane way I could find to get the referenced URL. The
          // format of the "reason" string may change in the future,
          // though I don't think that is likely to happen.
          const match = message.reason.match(/`([^`]+)`/);
          return match && !urlIsRedirect(file, match[1]);
        }

        return true;
      });

    return file;
  });
}

function validateLinks() {
  return new Promise((resolve, reject) => {
    engine({
      processor: remark(),
      files: ['!(scripts|node_modules|.git)/**/*.md', '*.md'],
      // use the following for testing
      // files: ['scripts/*.md'],
      plugins: ['remark-validate-links'],
      silent: true,
      out: false,
    }, (err, code, context) => {
      if(err) return reject(err);
      resolve(context.files);
    });
  });
}

const start = Date.now();
validateLinks()
  .then(validateRedirects)
  .then(vfiles => {
    console.log(reporter(vfiles));
    console.log('DONE IN', Date.now() - start, 'MS');
  })
  .catch(err => {
    console.log('There was an error', err);
  });
