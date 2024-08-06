import { head, tail, merge, MENTION_MATCH, docSort } from "./forwards.mjs";
import replaceAll from "./replace-all.mjs";
import db from "./database.mjs";

const fix = (forwards, doc) => {
  const splitForwords = [];
  for (const forward of forwards) {
    const H = head(forward);
    const T = tail(forward);
    for (const h of H) {
      const item = [h];
      if (T) {
        item.push(T);
      }

      splitForwords.push(item);
    }
  }
  const orderedForwords = splitForwords.sort(([a], [b]) => {
    if (a.startsWith("#") && !b.startsWith("#")) {
      return -1;
    }
    if (b.startsWith("#") && !a.startsWith("#")) {
      return 1;
    }
    return docSort(doc)(a, b);
  });

  const mergedForwards = orderedForwords.reduce((p, current) => {
    const previous = p.pop();
    if (!previous) {
      p.push(current);
    } else {
      if (previous[0] === current[0]) {
        p.push(merge(previous, current, doc));
      } else {
        p.push(previous);
        p.push(current);
      }
    }
    return p;
  }, []);

  const sequential = [];
  const simultaneous = [];

  for (const [head, tail] of mergedForwards) {
    const item = [head];
    if (tail) {
      item.push(tail);
    }
    if (head.startsWith("#")) {
      sequential.push(item);
    } else {
      simultaneous.push(item);
    }
  }
  return [sequential, simultaneous];
};

const processPost = async (original) => {
  const match = new RegExp(MENTION_MATCH.source, MENTION_MATCH.flags);
  const forwards = [];
  const dehydrated = await replaceAll(original, match, async (exec) => {
    const { padStart = "", padEnd = "" } = exec.groups;
    const forward = [];
    let current = forward;
    let prev;
    const groups = exec[0].split("|");
    let groupcount = groups.length;
    for (const group of groups) {
      for (let match of group.split(",")) {
        match = match.trim();
        if (match.startsWith("#")) {
          current.push(match);
        } else {
          if (match.startsWith("@")) {
            match = match.slice(1);
          }
          const agent = await db.getAgentByName(match);
          const { id } = agent;
          current.push(id);
        }
      }
      if ((groupcount -= 1 > 0)) {
        prev = current;
        current = [];
        prev.push(current);
      }
    }
    forwards.push(forward);
    return `${padStart}${head(forward).join(",")}${padEnd}`;
  });
  return [dehydrated, original, fix(forwards, dehydrated)];
};
//
db.init({
  "agent:0a1b23": { name: "billy" },
  "agent:1a2bc3": { name: "ai" },
  "agent:2a2b2c": { name: "carmen-sandiego" },
});
db.newAgent({ name: "joebart" });
console.log("Starting DB ⤓");
console.table(db);
console.log("-".repeat(2 ** 6));
//
const POSTS = [
  `@billy, @jane,#pop|#tart hello!
  @agent:2a2b2c|agent:123,@billyboy|#technical&key=value #ready hello as well!
  How the heck are you you @bob|@billyboy?!
  @lexy,@luna how are the kids?
  `,
  `@carmen-sandiego,@hobart-humperdink|#anger-management are you going to comicon? #comicon|travel agent:2a2b2c`,
  `@author|#one @author|#two @author|#three`,
  "##utc|##timetool",
];
const PROCESSED = await Promise.all(POSTS.map(processPost));
for (const [dehydrated, original, [sequential, simultaneous]] of PROCESSED) {
  console.log("original:\n", original);
  console.log("parsed:\n", dehydrated);
  console.log("sequential:\n", sequential);
  console.log("simultaneous:\n", simultaneous);
  console.log("-".repeat(2 ** 6));
}
console.log("-".repeat(2 ** 6));
console.table(db);
console.log("Ending DB ⤒");

/*
------------------
In what UTC timezone is London?
@world-traveler|#timetool
---
  [@world-traveler] London is UTC+0
  #timetool
---
    [#timetool] The time in UTC+0 is 12:00pm
------------------
What is 1+1?
#calc|@numerologist,@mathemeticial|@responder
---
  1 + 1 is 2
  @numerologist,@mathemeticial|#calc
---
    [@numerologist] 2 is the number of fthe future!
    @responder
---
      [@responder] yup yup
---
    [@mathemeticial] 2 is greather thand 3
    @responder
---
      [@responder] true dat!
------------------

What time is it?
#timezone?timeszone=UTC+0


*/
