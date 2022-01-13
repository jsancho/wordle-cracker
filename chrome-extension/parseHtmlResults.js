const parseHtmlTileResults = () => {
  const usedRows = document
    .querySelector("game-app")
    .shadowRoot.querySelectorAll("game-row[letters]:not([letters=''])");

  const hint = Array(5).fill("*");
  const misses = Array(5).fill([]);
  const exclude = [];

  usedRows.forEach((row) => {
    const t = row.shadowRoot.querySelectorAll("game-tile");
    const tiles = Array.from(t);

    for (let i = 0; i < 5; i++) {
      const letter = tiles[i].getAttribute("letter");
      const evaluation = tiles[i].getAttribute("evaluation");

      switch (evaluation) {
        case "correct":
          hint.splice(i, 1, letter);
          break;
        case "present":
          misses[i] =
            misses[i] && misses[i].length ? [...misses[i], letter] : [letter];
          break;
        case "absent":
          if (!exclude.includes(letter)) exclude.push(letter);
          break;
      }
    }
  });

  const include = misses.reduce((previous, current) => {
    return [...new Set([...previous, ...current])];
  }, []);

  return {
    hint: hint.join(""),
    include: include.join(""),
    exclude: exclude.join(""),
    misses,
  };
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "parseHtml") {
    const results = parseHtmlTileResults();
    sendResponse(results);
  }
});