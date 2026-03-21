const { JSDOM } = require('jsdom');
const { log } = require('node:console');
const fetch = globalThis.fetch || require('node-fetch');

const words = ['world'];

(async () => {
  for (const word of words) {
    try {
      const url = `https://dictionary.cambridge.org/vi/pronunciation/english/${encodeURIComponent(word)}`;
      const res = await fetch(url);
      const html = await res.text();
      const doc = new JSDOM(html).window.document;

      let pronounce = null;
      let sound = null;

      const regionNodes = doc.getElementsByClassName('primary-pron');
      for (const regionNode of regionNodes) {
        const regionText = regionNode.children[0].getAttribute('data-pron-region');
        if (regionText === 'US') {
          const soundNodes = regionNode.getElementsByTagName('source');
          for (const soundNode of soundNodes) {
              if (soundNode.getAttribute('type') === 'audio/mpeg') {
                sound = 'https://dictionary.cambridge.org' + soundNode.getAttribute('src');
                break;
              }
          }
          const pronounceNode = regionNode.getElementsByClassName('pron')[0];
          if (pronounceNode) {
            pronounce = pronounceNode.textContent;
          }
          break;
        }
      }
      console.log('=>', word, { pronounce, sound, url });
      
    } catch (e) {
      console.error('err', word, e && e.message ? e.message : e);
    }
  }
})();
