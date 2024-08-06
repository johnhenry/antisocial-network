export const returnFirstResult = (iterator, background = false) =>
  new Promise(async (resolve, reject) => {
    let resolved = false;
    try {
      for await (const x of iterator) {
        if (!resolved) {
          resolve(x);
          resolved = true;
          if (!background) {
            break;
          }
        }
      }
    } catch (e) {
      if (!resolved) {
        reject(e);
      }
    }
  });
