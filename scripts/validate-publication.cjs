// Executar antes de preparar a publicação: node validate-publication.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../src/content/revisaja.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const config = script.slice(script.indexOf('const CONFIG ='), script.indexOf('const escapeHTML'));
const validation = script.slice(script.indexOf('function publicationIssues()'), script.indexOf('window.REVISAJA_VALIDATION'));
const issues = vm.runInNewContext(config + '\n' + validation + '\npublicationIssues()', {URL});
if (issues.length) {
  console.error('Publicação bloqueada. Resolver antes de publicar:\n' + issues.map(issue => '- ' + issue).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Configuração preenchida. Ainda é necessária a aprovação visual e de publicação do proprietário.');
}
