const FIRST_NAMES = [
  "Aaron",
  "Abigail",
  "Adam",
  "Adrian",
  "Aiden",
  "Aimee",
  "Alan",
  "Albert",
  "Alex",
  "Alexander",
  "Alexandra",
  "Alexis",
  "Alice",
  "Alicia",
  "Alistair",
  "Alma",
  "Alyssa",
  "Amanda",
  "Amber",
  "Amir",
  "Amy",
  "Anders",
  "Anderson",
  "Andrea",
  "Andrew",
  "Angel",
  "Angela",
  "Angelica",
  "Angelina",
  "Anita",
  "Ann",
  "Anna",
  "Annette",
  "Anthony",
  "Antonia",
  "Arlo",
  "Armani",
  "Arthur",
  "Asher",
  "Ashley",
  "Ashton",
  "Audrey",
  "Austin",
  "Ayden",
  "Aziel",
  "Banks",
  "Barbara",
  "Beau",
  "Beckett",
  "Belinda",
  "Bellamy",
  "Benjamin",
  "Benson",
  "Bentlee",
  "Bentley",
  "Bernadette",
  "Bernice",
  "Bessie",
  "Beth",
  "Bethany",
  "Betty",
  "Beverley",
  "Beverly",
  "Billie",
  "Billy",
  "Bobby",
  "Boden",
  "Bodhi",
  "Bowie",
  "Bradley",
  "Brady",
  "Brandon",
  "Brandy",
  "Brantley",
  "Brayden",
  "Braylon",
  "Brenda",
  "Brian",
  "Brianna",
  "Briggs",
  "Brittany",
  "Brock",
  "Brooks",
  "Bruce",
  "Bryan",
  "Bryson",
  "Caden",
  "Caitlin",
  "Caleb",
  "Callan",
  "Callen",
  "Camden",
  "Cameron",
  "Candice",
  "Cannon",
  "Carl",
  "Carla",
  "Carmelo",
  "Carmen",
  "Carol",
  "Caroline",
  "Carolyn",
  "Carrie",
  "Carson",
  "Carter",
  "Case",
  "Casen",
  "Cash",
  "Catherine",
  "Cathy",
  "Chance",
  "Charlene",
  "Charles",
  "Charlotte",
  "Chase",
  "Cheryl",
  "Christian",
  "Christina",
  "Christine",
  "Christopher",
  "Christy",
  "Cindy",
  "Clara",
  "Claudia",
  "Cohen",
  "Cole",
  "Colleen",
  "Colson",
  "Colt",
  "Colton",
  "Connor",
  "Conor",
  "Constance",
  "Cooper",
  "Crosby",
  "Cynthia",
  "Damian",
  "Daniel",
  "Danielle",
  "David",
  "Dawn",
  "Dawson",
  "Daxton",
  "Deanna",
  "Debbie",
  "Deborah",
  "Debra",
  "Declan",
  "Delores",
  "Denise",
  "Dennis",
  "Desiree",
  "Diana",
  "Diane",
  "Dina",
  "Dominic",
  "Donald",
  "Donna",
  "Doris",
  "Dorothea",
  "Dorothy",
  "Douglas",
  "Duke",
  "Dylan",
  "Easton",
  "Edward",
  "Elaine",
  "Eleanor",
  "Eli",
  "Elias",
  "Elijah",
  "Elizabeth",
  "Ella",
  "Ellen",
  "Elsie",
  "Emerson",
  "Emery",
  "Emily",
  "Emma",
  "Emmanuel",
  "Emmett",
  "Ephraim",
  "Eric",
  "Erica",
  "Esther",
  "Ethan",
  "Eugene",
  "Eugenia",
  "Eva",
  "Evan",
  "Evelyn",
  "Everett",
  "Ezra",
  "Faith",
  "Felix",
  "Finley",
  "Finn",
  "Finnegan",
  "Fisher",
  "Fletcher",
  "Florence",
  "Ford",
  "Frances",
  "Francesca",
  "Francisco",
  "Frank",
  "Gabriel",
  "Gael",
  "Gage",
  "Gail",
  "Gary",
  "Genevieve",
  "George",
  "Georgia",
  "Gerald",
  "Gina",
  "Giovanni",
  "Gloria",
  "Grace",
  "Grayson",
  "Gregory",
  "Grey",
  "Gunner",
  "Gwendolyn",
  "Hannah",
  "Harlan",
  "Harlem",
  "Harold",
  "Harrison",
  "Harvey",
  "Hazel",
  "Heath",
  "Heather",
  "Heidi",
  "Helen",
  "Hendrix",
  "Henry",
  "Hilda",
  "Hollis",
  "Holly",
  "Hudson",
  "Hugo",
  "Hunter",
  "Ian",
  "Ira",
  "Irene",
  "Isaac",
  "Isabella",
  "Isaiah",
  "Jace",
  "Jack",
  "Jackson",
  "Jacob",
  "Jacqueline",
  "Jacquelyn",
  "Jalen",
  "James",
  "Jameson",
  "Jamie",
  "Jamison",
  "Jana",
  "Janet",
  "Janice",
  "Janine",
  "Jasmine",
  "Jason",
  "Jax",
  "Jaxon",
  "Jaxson",
  "Jaxton",
  "Jay",
  "Jayce",
  "Jayden",
  "Jean",
  "Jeanne",
  "Jeffrey",
  "Jennifer",
  "Jeremiah",
  "Jeremy",
  "Jerry",
  "Jesse",
  "Jessica",
  "Jessie",
  "Jill",
  "Joan",
  "Jody",
  "Joe",
  "Johanna",
  "John",
  "Johnny",
  "Jonathan",
  "Jordan",
  "Jose",
  "Joseph",
  "Joshua",
  "Josiah",
  "Joy",
  "Joyce",
  "Juan",
  "Juanita",
  "Judith",
  "Judy",
  "Julia",
  "Julie",
  "Julius",
  "Justin",
  "Kaden",
  "Kai",
  "Kaiser",
  "Kaison",
  "Kaitlyn",
  "Kaleb",
  "Kane",
  "Kara",
  "Karen",
  "Karter",
  "Kash",
  "Katherine",
  "Kathleen",
  "Kathryn",
  "Katie",
  "Katrina",
  "Kay",
  "Kayden",
  "Kayla",
  "Keegan",
  "Keith",
  "Kelli",
  "Kelly",
  "Kenneth",
  "Kerry",
  "Kevin",
  "Kimberly",
  "Kingston",
  "Kirsten",
  "Knox",
  "Kobe",
  "Krista",
  "Kristen",
  "Kristin",
  "Kristina",
  "Kristine",
  "Kyle",
  "Kylian",
  "Kyrie",
  "Landon",
  "Langston",
  "Larry",
  "Laura",
  "Lauren",
  "Lawrence",
  "Leah",
  "Leanne",
  "Legend",
  "Leif",
  "Leighton",
  "Leland",
  "Lena",
  "Lennox",
  "Leo",
  "Leonardo",
  "Levi",
  "Liam",
  "Lillian",
  "Lincoln",
  "Linda",
  "Lisa",
  "Logan",
  "Lois",
  "Lori",
  "Lorraine",
  "Louis",
  "Loyal",
  "Lucas",
  "Lucia",
  "Lucian",
  "Lucille",
  "Lucy",
  "Luka",
  "Luke",
  "Lydia",
  "Lynn",
  "Lynne",
  "Maddox",
  "Madeline",
  "Madison",
  "Mae",
  "Magnus",
  "Malakai",
  "Malcolm",
  "Marcy",
  "Margaret",
  "Maria",
  "Marian",
  "Marie",
  "Marilyn",
  "Marina",
  "Marissa",
  "Marjorie",
  "Mark",
  "Marlene",
  "Marsha",
  "Marshall",
  "Martha",
  "Martin",
  "Mary",
  "Mason",
  "Matthew",
  "Maverick",
  "Maxwell",
  "Megan",
  "Melinda",
  "Melissa",
  "Melody",
  "Micah",
  "Michael",
  "Michelle",
  "Miles",
  "Miller",
  "Milo",
  "Miranda",
  "Miriam",
  "Molly",
  "Monique",
  "Nadine",
  "Nancy",
  "Naomi",
  "Natalia",
  "Natalie",
  "Nathan",
  "Nellie",
  "Nicholas",
  "Nicole",
  "Nikki",
  "Nina",
  "Nixon",
  "Noah",
  "Nolan",
  "Nora",
  "Oakley",
  "Odin",
  "Olga",
  "Oliver",
  "Olivia",
  "Orion",
  "Owen",
  "Pamela",
  "Parker",
  "Patricia",
  "Patrick",
  "Patsy",
  "Patty",
  "Paul",
  "Pauline",
  "Peggy",
  "Penny",
  "Peter",
  "Peyton",
  "Philip",
  "Pierce",
  "Porter",
  "Preston",
  "Quincy",
  "Rachel",
  "Ralph",
  "Ramona",
  "Randy",
  "Raquel",
  "Rayan",
  "Raymond",
  "Rebecca",
  "Rebekah",
  "Reid",
  "Remington",
  "Renee",
  "Reuben",
  "Rex",
  "Rhett",
  "Rhonda",
  "Richard",
  "Ridge",
  "Rita",
  "Robert",
  "Roberta",
  "Roger",
  "Romeo",
  "Ronald",
  "Ronin",
  "Rosa",
  "Rosalie",
  "Rose",
  "Rowan",
  "Roy",
  "Royce",
  "Ruby",
  "Russell",
  "Ruth",
  "Ryan",
  "Ryder",
  "Ryker",
  "Rylan",
  "Ryland",
  "Sabrina",
  "Sadie",
  "Sage",
  "Sally",
  "Samantha",
  "Samuel",
  "Sandra",
  "Sara",
  "Sarah",
  "Sawyer",
  "Scott",
  "Sean",
  "Sebastian",
  "Shannon",
  "Sharon",
  "Shauna",
  "Shelby",
  "Shepherd",
  "Sheri",
  "Sherri",
  "Sherry",
  "Sheryl",
  "Shirley",
  "Solomon",
  "Sophia",
  "Soren",
  "Stacey",
  "Stacy",
  "Stephanie",
  "Stephen",
  "Sterling",
  "Steven",
  "Sullivan",
  "Susan",
  "Suzanne",
  "Sylvia",
  "Talon",
  "Tamara",
  "Tanya",
  "Tara",
  "Teresa",
  "Terry",
  "Tessa",
  "Thatcher",
  "Theo",
  "Theresa",
  "Therese",
  "Thomas",
  "Tiffany",
  "Timothy",
  "Titus",
  "Tobin",
  "Tonya",
  "Tracy",
  "Tricia",
  "Tristan",
  "Tucker",
  "Tyler",
  "Tyson",
  "Valentino",
  "Vanessa",
  "Vaughn",
  "Vera",
  "Veronica",
  "Vicki",
  "Vickie",
  "Victoria",
  "Vincent",
  "Violet",
  "Virginia",
  "Vivian",
  "Walter",
  "Warren",
  "Wayne",
  "Wendy",
  "Westley",
  "Weston",
  "Wilder",
  "William",
  "Willie",
  "Wyatt",
  "Xavier",
  "Yolanda",
  "Yusuf",
  "Yvonne",
  "Zachary",
  "Zander",
  "Zane",
  "Zayden",
  "Zeke",
  "Zion",
];

const LAST_NAMES = [
  "Adams",
  "Aguilar",
  "Alexander",
  "Allen",
  "Alvarado",
  "Alvarez",
  "Anderson",
  "Andrews",
  "Armstrong",
  "Arnold",
  "Austin",
  "Bailey",
  "Baker",
  "Banks",
  "Barnes",
  "Bell",
  "Bennett",
  "Berry",
  "Bishop",
  "Black",
  "Bowman",
  "Boyd",
  "Bradley",
  "Brooks",
  "Brown",
  "Bryant",
  "Burke",
  "Burns",
  "Burton",
  "Butler",
  "Campbell",
  "Carlson",
  "Carpenter",
  "Carr",
  "Carroll",
  "Carter",
  "Castillo",
  "Castro",
  "Chapman",
  "Chavez",
  "Chen",
  "Clark",
  "Cole",
  "Coleman",
  "Collins",
  "Contreras",
  "Cook",
  "Cooper",
  "Cox",
  "Crawford",
  "Cruz",
  "Cunningham",
  "Daniels",
  "Davis",
  "Day",
  "Dean",
  "Delgado",
  "Diaz",
  "Dixon",
  "Dominguez",
  "Duncan",
  "Dunn",
  "Edwards",
  "Elliott",
  "Ellis",
  "Espinoza",
  "Estrada",
  "Evans",
  "Ferguson",
  "Fernandez",
  "Fields",
  "Fisher",
  "Flores",
  "Ford",
  "Foster",
  "Fowler",
  "Fox",
  "Franklin",
  "Freeman",
  "Fuller",
  "Garcia",
  "Gardner",
  "Garrett",
  "Garza",
  "George",
  "Gibson",
  "Gilbert",
  "Gomez",
  "Gonzales",
  "Gonzalez",
  "Gordon",
  "Graham",
  "Grant",
  "Gray",
  "Green",
  "Greene",
  "Griffin",
  "Guerrero",
  "Gutierrez",
  "Guzman",
  "Hall",
  "Hamilton",
  "Hansen",
  "Hanson",
  "Harper",
  "Harris",
  "Harrison",
  "Hart",
  "Harvey",
  "Hawkins",
  "Hayes",
  "Henderson",
  "Henry",
  "Hernandez",
  "Herrera",
  "Hicks",
  "Hill",
  "Hoffman",
  "Holmes",
  "Howard",
  "Howell",
  "Hudson",
  "Hughes",
  "Hunt",
  "Hunter",
  "Jackson",
  "Jacobs",
  "James",
  "Jenkins",
  "Jensen",
  "Jimenez",
  "Johnson",
  "Johnston",
  "Jones",
  "Jordan",
  "Kelley",
  "Kelly",
  "Kennedy",
  "Kim",
  "King",
  "Knight",
  "Lane",
  "Larson",
  "Lawrence",
  "Lawson",
  "Le",
  "Lee",
  "Lewis",
  "Li",
  "Little",
  "Long",
  "Lopez",
  "Lucas",
  "Luna",
  "Lynch",
  "Maldonado",
  "Marquez",
  "Marshall",
  "Martin",
  "Martinez",
  "Mason",
  "Matthews",
  "McCoy",
  "McDonald",
  "Medina",
  "Mejia",
  "Mendez",
  "Mendoza",
  "Meyer",
  "Miller",
  "Mills",
  "Mitchell",
  "Montgomery",
  "Moore",
  "Morales",
  "Moreno",
  "Morgan",
  "Morris",
  "Morrison",
  "Munoz",
  "Murphy",
  "Murray",
  "Myers",
  "Nelson",
  "Nguyen",
  "Nichols",
  "Nunez",
  "O'Brien",
  "Oliver",
  "Olson",
  "Ortega",
  "Ortiz",
  "Owens",
  "Padilla",
  "Palmer",
  "Park",
  "Parker",
  "Patel",
  "Patterson",
  "Payne",
  "Pena",
  "Perez",
  "Perkins",
  "Perry",
  "Peters",
  "Peterson",
  "Phillips",
  "Pierce",
  "Porter",
  "Powell",
  "Price",
  "Ramirez",
  "Ramos",
  "Ray",
  "Reed",
  "Reid",
  "Reyes",
  "Reynolds",
  "Rice",
  "Richards",
  "Richardson",
  "Riley",
  "Rios",
  "Rivera",
  "Roberts",
  "Robertson",
  "Robinson",
  "Rodriguez",
  "Rogers",
  "Rojas",
  "Romero",
  "Rose",
  "Ross",
  "Ruiz",
  "Russell",
  "Ryan",
  "Salazar",
  "Sanchez",
  "Sanders",
  "Sandoval",
  "Santiago",
  "Santos",
  "Schmidt",
  "Schultz",
  "Scott",
  "Shaw",
  "Silva",
  "Simmons",
  "Simpson",
  "Sims",
  "Singh",
  "Smith",
  "Snyder",
  "Soto",
  "Spencer",
  "Stephens",
  "Stevens",
  "Stewart",
  "Stone",
  "Sullivan",
  "Taylor",
  "Thomas",
  "Thompson",
  "Torres",
  "Tran",
  "Tucker",
  "Turner",
  "Valdez",
  "Vargas",
  "Vasquez",
  "Vazquez",
  "Vega",
  "Wagner",
  "Walker",
  "Wallace",
  "Walsh",
  "Wang",
  "Ward",
  "Warren",
  "Washington",
  "Watkins",
  "Watson",
  "Weaver",
  "Webb",
  "Weber",
  "Welch",
  "Wells",
  "West",
  "Wheeler",
  "White",
  "Williams",
  "Williamson",
  "Willis",
  "Wilson",
  "Wong",
  "Wood",
  "Woods",
  "Wright",
  "Yang",
  "Young",
];

const getRandomElement = (arr: string[]): string => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const nameGenerator = function* (
  limit = 32,
  firstNames = FIRST_NAMES,
  lastNames = LAST_NAMES
) {
  let count = 0;
  while (count < limit) {
    yield `${getRandomElement(firstNames)}-${getRandomElement(lastNames)}`;
    count++;
  }
  while (true) {
    yield `${Math.floor(Math.random() * 1000000)}`;
  }
};

export default nameGenerator;
