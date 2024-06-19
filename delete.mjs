// import { chunkit } from "semantic-chunking";

// const text = "some long text...";
// const chunkitOptions = {};
// const myChunks = await chunkit(text, chunkitOptions);
// console.log(myChunks);

// const nlp = require("compromise");
// https://www.npmjs.com/package/compromise
// https://github.com/jparkerweb/semantic-chunking
import compromise from "compromise";
import paragraphs from "compromise-paragraphs";
compromise.plugin(paragraphs); //done.
// const nlp = require("compromise");
function semanticChunker(text) {
  // Load the text into compromise
  const items = [];
  compromise(text)
    .paragraphs()
    .map((p) => items.push(p.text()));
  return items;
}

function semanticChunker2(text) {
  // Load the text into compromise
  let doc = compromise(text);

  // Split the text into sentences
  let sentences = doc.sentences().out("array");

  // Further split sentences into meaningful chunks/phrases
  let chunks = sentences.map((sentence) => {
    let sentenceDoc = nlp(sentence);
    let terms = sentenceDoc.terms();
    let phrase = [];
    let phrases = [];

    terms.forEach((term) => {
      if (
        term.tags &&
        (term.tags.includes("Comma") || term.tags.includes("Conjunction"))
      ) {
        if (phrase.length > 0) {
          phrases.push(phrase.join(" "));
          phrase = [];
        }
      } else {
        phrase.push(term.text);
      }
    });

    if (phrase.length > 0) {
      phrases.push(phrase.join(" "));
    }

    return phrases;
  });

  // Flatten the array of chunks and return it
  return chunks.flat();
}

// Example usage
const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Morbi tristique senectus et netus et malesuada fames ac turpis. Fringilla est ullamcorper eget nulla. Aliquet nibh praesent tristique magna sit amet. Eu facilisis sed odio morbi quis commodo odio. Urna porttitor rhoncus dolor purus. Ut lectus arcu bibendum at varius vel pharetra vel. Neque egestas congue quisque egestas. Et sollicitudin ac orci phasellus egestas tellus rutrum tellus pellentesque. Senectus et netus et malesuada fames.

Tempor orci dapibus ultrices in iaculis nunc. Vitae semper quis lectus nulla. Ultrices dui sapien eget mi proin. Egestas tellus rutrum tellus pellentesque eu. Viverra aliquet eget sit amet tellus cras adipiscing enim eu. Pharetra vel turpis nunc eget lorem dolor sed viverra ipsum. Massa massa ultricies mi quis hendrerit dolor magna eget est. Semper eget duis at tellus. Ut sem viverra aliquet eget sit. Placerat in egestas erat imperdiet sed euismod. Molestie ac feugiat sed lectus vestibulum mattis. Eu facilisis sed odio morbi quis commodo. Ultricies leo integer malesuada nunc vel risus commodo viverra. Consequat nisl vel pretium lectus quam. Pretium quam vulputate dignissim suspendisse. Parturient montes nascetur ridiculus mus.

Orci dapibus ultrices in iaculis nunc. Vitae tortor condimentum lacinia quis. Elit ut aliquam purus sit amet luctus venenatis. Pretium aenean pharetra magna ac placerat. Cursus vitae congue mauris rhoncus aenean vel elit. Cras tincidunt lobortis feugiat vivamus at augue eget. Sit amet volutpat consequat mauris nunc. At varius vel pharetra vel turpis nunc. Pellentesque adipiscing commodo elit at imperdiet. Purus in mollis nunc sed. Est velit egestas dui id ornare arcu odio ut sem. Urna nunc id cursus metus aliquam eleifend mi in nulla. Pretium fusce id velit ut tortor pretium viverra suspendisse. A pellentesque sit amet porttitor eget dolor morbi non arcu.

Ut placerat orci nulla pellentesque dignissim enim sit amet. Egestas sed sed risus pretium quam vulputate dignissim suspendisse in. Nec tincidunt praesent semper feugiat. Dui vivamus arcu felis bibendum ut tristique et. Lectus magna fringilla urna porttitor rhoncus dolor purus non enim. Consequat mauris nunc congue nisi vitae suscipit tellus. Aliquam ultrices sagittis orci a scelerisque purus semper. Eget nunc lobortis mattis aliquam. Cras ornare arcu dui vivamus arcu felis bibendum ut. Mauris nunc congue nisi vitae suscipit tellus mauris a. Sit amet consectetur adipiscing elit pellentesque habitant morbi.

Porttitor rhoncus dolor purus non enim praesent elementum. Tempor nec feugiat nisl pretium fusce id velit. Duis at tellus at urna condimentum mattis pellentesque. Sit amet purus gravida quis blandit turpis. Pretium nibh ipsum consequat nisl vel pretium. Lacus laoreet non curabitur gravida. Condimentum lacinia quis vel eros donec ac odio tempor orci. Diam donec adipiscing tristique risus nec feugiat. Nisl rhoncus mattis rhoncus urna neque viverra. Sed risus pretium quam vulputate. Aliquet porttitor lacus luctus accumsan tortor posuere ac. In hendrerit gravida rutrum quisque non tellus orci. Cursus metus aliquam eleifend mi in nulla posuere sollicitudin. Euismod quis viverra nibh cras pulvinar mattis. Sit amet cursus sit amet dictum sit amet justo. Nunc id cursus metus aliquam eleifend mi in. Purus gravida quis blandit turpis cursus in. Feugiat in fermentum posuere urna nec tincidunt.`;
const result = semanticChunker(text);

console.log(result);
