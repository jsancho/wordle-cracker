chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "suggestWord") {
    getSuggestions(request.gameResults).then((suggestions) => {
      // TODO: instead of returning first match, use an strategy,
      // e.g.
      // - word that will eliminate the most characters (count of more different characters)
      // - word that will eliminate the most characters (word more "different" to every other word)
      // - word with the most commonality (use a popularity ratio based on freedictionary.com, merriamwebster?)
      const topSuggestion = suggestions[0];

      // The message port closed before a response was received.
      sendResponse(topSuggestion);
    });

    // return true from the event listener to indicate you wish to send a response asynchronously
    // (this will keep the message channel open to the other end until sendResponse is called).
    return true;
  }
});

const getSuggestions = (gameResults) => {
  return requestDictionary().then((dictionary) => {
    return matchResultsToDictionary(gameResults, dictionary);
  });
};

const requestDictionary = () => {
  const file = chrome.runtime.getURL("wordle.txt");

  return fetch(file)
    .then((response) => response.text())
    .catch((error) => {
      console.log(error);
    });
};

const filterIncludedLetters = (dictionary, include) => {
  if (!include?.length) return dictionary;
  let wordTokens = dictionary.split(",");

  const chars = include.split("");
  // TODO: remove duplicate letters
  chars.forEach((char) => {
    wordTokens = wordTokens.filter((w) => w.includes(char));
  });

  return wordTokens.join(",");
};

const filterExcludedLetters = (dictionary, exclude) => {
  if (!exclude?.length) return dictionary;
  let wordTokens = dictionary.split(",");

  const chars = exclude.split("");
  // TODO: remove duplicate letters
  chars.forEach((char) => {
    wordTokens = wordTokens.filter((w) => !w.includes(char));
  });

  return wordTokens.join(",");
};

const matchResultsToDictionary = (results, dictionary) => {
  let workingDictionary = filterIncludedLetters(dictionary, results.include);
  workingDictionary = filterExcludedLetters(dictionary, results.exclude);

  const hintMatcher = results.hint.replace(/\*/g, "[a-z]");
  const wordMatcherExpression = `(${hintMatcher}),`;
  const wordMatcher = new RegExp(wordMatcherExpression, "g");
  const result = [...workingDictionary.matchAll(wordMatcher)];

  return result.map((r) => r[1]);
};