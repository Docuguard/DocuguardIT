// Word packs for charades game
// Each word pack has an ID, name, description, and list of words

export const wordPacks = {
  classic: {
    id: 'classic',
    name: 'Classic Charades',
    description: 'Funny and classic charades words perfect for any party',
    isPremium: false,
    words: [
      // Animals & Actions (20 words)
      'Penguin Sliding on Ice',
      'Octopus Playing Drums',
      'Giraffe Doing Yoga',
      'Flamingo Ballet Dancer',
      'Sloth Running Marathon',
      'Kangaroo Boxing',
      'Elephant Tiptoeing',
      'Monkey Typing',
      'Hippo Doing Splits',
      'T-Rex Trying to Clap',
      'Cat Coughing Hairball',
      'Dog Chasing Tail',
      'Chicken Crossing Road',
      'Snake on a Ladder',
      'Bear Riding Bicycle',
      'Dolphin Playing Basketball',
      'Gorilla Eating Banana',
      'Zebra Taking Selfie',
      'Parrot Telling Secrets',
      'Squirrel Hoarding Nuts',

      // Everyday Situations (20 words)
      'Stepping on LEGO',
      'Forgetting Someone\'s Name',
      'Brain Freeze from Ice Cream',
      'Stuck Zipper Emergency',
      'Walking into Spider Web',
      'Trying to be Quiet with Chips',
      'Uncontrollable Hiccups',
      'Burning Tongue on Pizza',
      'Losing at Rock Paper Scissors',
      'Tripping Over Nothing',
      'Autocorrect Fail',
      'Realizing Shirt Inside Out',
      'Waving at Wrong Person',
      'Dropping Phone in Toilet',
      'Running Out of Toilet Paper',
      'Sneezing While Eating',
      'Getting Haircut Gone Wrong',
      'Parallel Parking Fail',
      'Forgetting Why You Walked into Room',
      'Trying to Catch Falling Glass',

      // Jobs & Professions (15 words)
      'Mime at Comedy Show',
      'Breakdancing Librarian',
      'Nervous Bomb Squad',
      'Clumsy Surgeon',
      'Underwater Firefighter',
      'Robot Therapist',
      'Ninja Librarian',
      'DJ at Funeral',
      'Breakdancing Lawyer',
      'Skydiving Teacher',
      'Singing Dentist',
      'Dancing Traffic Cop',
      'Sleepy Security Guard',
      'Confused GPS Voice',
      'Yoga Instructor Falling',

      // Pop Culture & Movies (15 words)
      'Darth Vader Doing Laundry',
      'Superhero Changing Diaper',
      'Zombie Doing Taxes',
      'Pirate with Seasickness',
      'Cowboy Line Dancing',
      'Vampire Applying Sunscreen',
      'Wizard Losing Wand',
      'Knight in Shining Armor Rusting',
      'Ninja Stubbing Toe',
      'Mummy Unwrapping Gift',
      'Ghost Trying to be Scary',
      'Alien Taking Selfie',
      'Dinosaur Playing Piano',
      'Dragon with Hiccups',
      'Unicorn Farting Rainbows',

      // Food & Eating (15 words)
      'Spaghetti Slurping Contest',
      'Taco Shell Breaking',
      'Watermelon Seed Spitting',
      'Slippery Noodles Escaping',
      'Corn on the Cob Typewriter',
      'Ice Cream Melting Fast',
      'Hot Dog Eating Contest',
      'Pancake Flipping Fail',
      'Opening Stubborn Jar',
      'Cutting Onions Crying',
      'Milk Mustache Pride',
      'Fortune Cookie Philosophy',
      'Brain Freeze Dance',
      'Chopstick Beginner',
      'Popcorn Kernel in Teeth',

      // Sports & Activities (15 words)
      'Underwater Basket Weaving',
      'Extreme Ironing',
      'Competitive Napping',
      'Speed Walking Race',
      'Thumb Wrestling Championship',
      'Professional Procrastinator',
      'Invisible Jump Rope',
      'Synchronized Swimming Solo',
      'Backwards Running',
      'Air Guitar Solo',
      'Extreme Couponing',
      'Professional Bubble Wrapper',
      'Championship Pillow Fight',
      'Competitive Hair Flipping',
      'Olympic Couch Surfing'
    ]
  },

  movies: {
    id: 'movies',
    name: 'Movies & TV',
    description: 'Act out famous movie scenes and TV show moments',
    isPremium: true,
    words: [
      'Titanic Ship Sinking',
      'Spider-Man Web Swinging',
      'Jaws Shark Attack',
      'Harry Potter Wand Fight',
      'Matrix Bullet Dodge',
      'Star Wars Lightsaber Duel',
      'Home Alone Face Scream',
      'Jurassic Park T-Rex Running',
      'The Lion King Circle of Life',
      'Frozen Let It Go'
    ]
  },

  animals: {
    id: 'animals',
    name: 'Animals & Nature',
    description: 'Wildlife and nature-themed words',
    isPremium: true,
    words: [
      'Butterfly Emerging from Cocoon',
      'Woodpecker Headache',
      'Peacock Showing Off',
      'Chameleon Color Change',
      'Beaver Building Dam',
      'Whale Breaching',
      'Hummingbird Hovering',
      'Owl Head Spinning',
      'Seal Clapping',
      'Tortoise Racing Hare'
    ]
  },

  popCulture: {
    id: 'popCulture',
    name: 'Pop Culture 2024',
    description: 'Trending memes and viral moments',
    isPremium: true,
    price: 0.99,
    words: [
      'TikTok Dance Fail',
      'Instagram Filter Malfunction',
      'Zoom Call Frozen Face',
      'WiFi Signal Dance',
      'Charging Cable Tangled',
      'Autocorrect Betrayal',
      'Bluetooth Not Connecting',
      'Low Battery Panic',
      'Accidentally Unmuting',
      'Reply All Email Regret'
    ]
  },

  actions: {
    id: 'actions',
    name: 'Actions & Sports',
    description: 'Physical activities and sports',
    isPremium: true,
    words: [
      'Skydiving without Parachute Realization',
      'Bungee Jump Screaming',
      'Surfing Wipeout',
      'Rock Climbing Slip',
      'Skiing Into Tree',
      'Skateboard Trick Fail',
      'Trampoline Bounce Loss of Control',
      'Tightrope Walking Wobble',
      'Parkour Face Plant',
      'Ice Skating Fall'
    ]
  },

  mature: {
    id: 'mature',
    name: '18+ Mature Pack',
    description: 'For adult parties only!',
    isPremium: true,
    words: [
      'Hiding Browser History',
      'Walk of Shame',
      'Embarrassing Doctor Visit',
      'Fake Orgasm',
      'Beer Goggles Effect',
      'Drunk Texting Ex',
      'Tinder Date Catfish',
      'One Night Stand Sneaking Out',
      'Hangover Regret',
      'Strip Poker Loss'
    ]
  }
};

// Get word pack by ID
export const getWordPackById = (id) => {
  return wordPacks[id] || null;
};

// Get random words from pack
export const getRandomWordsFromPack = (packId, count = 5) => {
  const pack = wordPacks[packId];
  if (!pack) return [];

  const shuffled = [...pack.words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get multiple word packs combined
export const getCombinedWords = (packIds, count = 5) => {
  const allWords = [];

  packIds.forEach(packId => {
    const pack = wordPacks[packId];
    if (pack) {
      allWords.push(...pack.words);
    }
  });

  const shuffled = [...allWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Check if user has access to word pack
export const hasAccessToWordPack = (pack, userProfile) => {
  if (!pack.isPremium) return true;
  if (userProfile.isPremium) return true;
  if (pack.price && userProfile.purchasedPacks?.includes(pack.id)) return true;
  return false;
};
