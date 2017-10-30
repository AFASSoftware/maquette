import { Mapping } from './interfaces';

/**
 * Creates a {@link Mapping} instance that keeps an array of result objects synchronized with an array of source objects.
 * See {@link http://maquettejs.org/docs/arrays.html|Working with arrays}.
 *
 * @param <Source>       The type of source items. A database-record for instance.
 * @param <Target>       The type of target items. A [[MaquetteComponent]] for instance.
 * @param getSourceKey   `function(source)` that must return a key to identify each source object. The result must either be a string or a number.
 * @param createResult   `function(source, index)` that must create a new result object from a given source. This function is identical
 *                       to the `callback` argument in `Array.map(callback)`.
 * @param updateResult   `function(source, target, index)` that updates a result to an updated source.
 */
export let createMapping = <Source, Target>(
  getSourceKey: (source: Source) => (string | number),
  createResult: (source: Source, index: number) => Target,
  updateResult: (source: Source, target: Target, index: number) => void): Mapping<Source, Target> => {
  let keys = [] as Object[];
  let results = [] as Target[];

  return {
    results: results,
    map: (newSources: Source[]) => {
      let newKeys = newSources.map(getSourceKey);
      let oldTargets = results.slice();
      let oldIndex = 0;
      for (let i = 0; i < newSources.length; i++) {
        let source = newSources[i];
        let sourceKey = newKeys[i];
        if (sourceKey === keys[oldIndex]) {
          results[i] = oldTargets[oldIndex];
          updateResult(source, oldTargets[oldIndex], i);
          oldIndex++;
        } else {
          let found = false;
          for (let j = 1; j < keys.length + 1; j++) {
            let searchIndex = (oldIndex + j) % keys.length;
            if (keys[searchIndex] === sourceKey) {
              results[i] = oldTargets[searchIndex];
              updateResult(newSources[i], oldTargets[searchIndex], i);
              oldIndex = searchIndex + 1;
              found = true;
              break;
            }
          }
          if (!found) {
            results[i] = createResult(source, i);
          }
        }
      }
      results.length = newSources.length;
      keys = newKeys;
    }
  };
};
