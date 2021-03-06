chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "parseHtml") {
    const results = parseHtmlTileResults();
    sendResponse(results);
  }
});

const parseHtmlTileResults = () => {
  const usedRows = document
    .querySelector("game-app")
    .shadowRoot.querySelectorAll("game-row[letters]:not([letters=''])");

  const hint = Array(5).fill("*");
  const misses = Array(5).fill([]);
  const include = [];
  const absent = [];

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
          if (!include.includes(letter)) {
            include.push(letter);
          }
          break;
        case "absent":
          if (!absent.includes(letter)) {
            absent.push(letter);
          }

          misses[i] =
            misses[i] && misses[i].length ? [...misses[i], letter] : [letter];

          break;
      }
    }
  });

  const exclude = absent.reduce((previous, current) => {
    // do not exclude grey letters that have been found as valid in other positions
    return hint.includes(current) || include.includes(current)
      ? previous
      : [...new Set([...previous, ...current])];
  }, []);

  return {
    hint,
    include,
    exclude,
    misses,
  };
};
