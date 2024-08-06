// export const MENTION_MATCH =
//   /(?<padStart>^|\s)((?:(?:@?agent:)|[@#])[a-zA-Z0-9_$€£¥%=+.?&-]*[a-zA-Z0-9_$€£¥%]+)([|,](?:(?:@?agent:)|[@#])[a-zA-Z0-9_$€£¥%=+.?&-]*[a-zA-Z0-9_$€£¥%]+)*(?<padEnd>\s|$)*?/g;

export const MENTION_MATCH =
  /(?<padStart>^|\s)((?:(?:@?agent:)|@|#{1,2})[a-zA-Z0-9_$€£¥%=+.?&-]*[a-zA-Z0-9_$€£¥%]+)([|,](?:(?:@?agent:)|@|#{1,2})[a-zA-Z0-9_$€£¥%=+.?&-]*[a-zA-Z0-9_$€£¥%]+)*(?<padEnd>\s|$)*?/g;

export const head = (tree) => tree.filter((s) => !Array.isArray(s));
export const tail = (tree) => tree.find((s) => Array.isArray(s));
export const docSort = (doc) => (a, b) => {
  return doc.indexOf(a) - doc.indexOf(b);
};
export const merge = (tree1, tree2, doc) => {
  const h1 = head(tree1);
  const h2 = head(tree2);
  const h = new Set([...h1, ...h2]);
  const t1 = tail(tree1);
  const t2 = tail(tree2);
  if (t1 && t2) {
    return [...h, merge(t1, t2, doc)];
  } else if (t1) {
    return [...h, t1];
  } else if (t2) {
    return [...h, t2];
  }
  return [...h];
};

export const print = (tree, indent = 0) => {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    if (Array.isArray(item)) {
      // This is a nested mention tree
      console.log(`${" ".repeat(indent)}->:`);
      print(item, indent + 2);
    } else {
      // This is a string (message)
      console.log(`${" ".repeat(indent)}${item}`);
    }
  }
};
