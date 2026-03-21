const fs = require('fs/promises');
const path = require('path');
const { JSDOM } = require('jsdom');

async function fetchCambridgePronunciation(word) {
    try {
        const url = `https://dictionary.cambridge.org/vi/pronunciation/english/${encodeURIComponent(word.toLowerCase())}`;
        console.log('Fetching Cambridge pronunciation for', word, 'from', url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        const doc = new JSDOM(html).window.document;

        let pronounce = null;
        let sound = null;

        const regionNodes = doc.getElementsByClassName('primary-pron');
        for (const regionNode of Array.from(regionNodes)) {
            const firstChild = regionNode.children[0];
            const regionText = firstChild && firstChild.getAttribute
                ? firstChild.getAttribute('data-pron-region')
                : null;
            if (regionText === 'US') {
                const soundNodes = regionNode.getElementsByTagName('source');
                for (const soundNode of Array.from(soundNodes)) {
                    if (soundNode.getAttribute('type') === 'audio/mpeg') {
                        sound = 'https://dictionary.cambridge.org' + soundNode.getAttribute('src');
                        break;
                    }
                }
                const pronounceNode = regionNode.getElementsByClassName('pron')[0];
                if (pronounceNode) pronounce = pronounceNode.textContent;
                break;
            }
        }

        console.log(word, { pronounce, sound });
        return { pronounce, sound };
    } catch (err) {
        console.error('Error fetching Cambridge pronunciation', err);
        return { pronounce: null, sound: null };
    }
}

async function main() {
    const jsonPath = path.join(process.cwd(), 'src', 'assets', 'topics.json');
    try {
        const raw = await fs.readFile(jsonPath, 'utf8');
        const data = JSON.parse(raw);
        if (!data.topics || data.topics.length === 0) {
            console.error('No topics found in', jsonPath);
            return;
        }

        let i = 0;
        for (const topic of data.topics) {
            console.log(i, 'Processing topic:', topic.name);
            if (i == 0) {
                i += 1;
                continue; // Skip the first topic
            }
            for (const vocab of topic.vocabularies) {
                const word = vocab.name;
                const { pronounce, sound } = await fetchCambridgePronunciation(word);

                if (pronounce) {
                    vocab.phonetics = pronounce.trim();
                }
                if (sound) {
                    vocab.soundUrl = sound;
                }

                // Add a small delay between requests to be polite to the server
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf8');
        console.log('Updated', jsonPath);
    } catch (err) {
        console.error('Error updating topics.json', err);
    }
}

main();
