const firstNames = [
  "John",
  "Emma",
  "Michael",
  "Sophia",
  "William",
  "Olivia",
  "James",
  "Ava",
  "Benjamin",
  "Isabella",
  "Jacob",
  "Mia",
  "Elijah",
  "Charlotte",
  "Alexander",
  "Amelia",
  "Daniel",
  "Harper",
  "Matthew",
  "Evelyn",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Jones",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Garcia",
  "Martinez",
  "Robinson",
];

const genRandomeHyphenatedName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName}-${lastName}`;
};
export { genRandomeHyphenatedName };
export default genRandomeHyphenatedName;
