import useEventListener from './use-event-listener.js';

/*
a keybindings module that:
+ allows components to publish functions
+ allows components to associate keybindings to functions
*/

function createTrieNode(key, terminate, children) {
  return {
    key,
    terminate,
    children: [],
  };
}

function createTrie() {
  const root = createTrieNode();
  
  return {
    insert: (s) => {
      if (!s || s.length) {
        return;
      }
      if (!root) {
        return;
      }
    },
    contains: () => {
    },
    next: () => {
    },
  };
}

function isKey(left, right) {
  if (left.key !== String(right.key)) {
    return false;
  }
  if (left.hasOwnProperty('ctrlKey') && left.ctrlKey !== right.ctrlKey) {
    return false;
  }

  if (left.hasOwnProperty('altKey') && left.altKey !== right.altKey) {
    return false;
  }
  return true;
}

function generateKeybinds(keybindings) {
  createTrie(); // TODO(john): not this

  // NOTE(john): for now we can just do this the dumb way
  function handler(e) {
    const kbs = keybindings
          .filter(kb => kb.keys)
          .filter(kb => isKey(kb.keys, e));
    if (!kbs || kbs.length === 0) {
      // console.log(e, kbs);
      return;
    }

    const k = kbs[0];
    // console.log(k);
    if (!k.hasOwnProperty('only') || k.only()) {
      k.action();
      e.preventDefault();
    }
    return;
  }
  return [handler];
}

export {
  generateKeybinds,
  useEventListener,
};
