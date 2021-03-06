import { program } from 'commander';
import { suggestWords } from './commands/suggestWords';
import { parseDictionaries } from './commands/parseDictionaries';

program
  .command('suggest')
  .argument(
    '<hint>',
    'The initial value to match. Use * as a wildcard for unknown positions'
  )
  .option(
    '-i, --include <include>',
    'The letters to include, e.g. yellow letters from a previous attempt'
  )
  .option(
    '-e, --exclude <exclude>',
    'The letters to exclude, e.g. greyed out letters from a previous attempt'
  )
  .description(
    'Suggest words that will match the letters in each position for the hint provided'
  )
  .action(suggestWords);

program
  .command('parse-dicts')
  .description('Load a dictionary and reduce it to 5 characters only')
  .action(parseDictionaries);

program.parse();
