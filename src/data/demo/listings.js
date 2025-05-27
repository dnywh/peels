const createDemoListing = (data) => ({
  is_demo: true,
  area_name: "Newport",
  ...data,
});

export const demoListings = [
  createDemoListing({
    name: "Carroll St Community Farm",
    owner_first_name: "Kerri",
    type: "community",
    avatar: "farm.jpg",
    map_position: {
      x: -40,
      y: -35,
    },
    description:
      "We meet Saturday mornings to turn compost piles. New members are always welcome.\nJust looking to drop off scraps? Come any time. See the below photos for where the compost bays are.",
    accepted_items: ["Anything organic", "Shredded paper"],
    rejected_items: ["Meat and dairy", "Limited amounts of citrus"],
  }),
  createDemoListing({
    owner_first_name: "Matt",
    type: "residential",
    avatar: "skate.jpg",
    map_position: {
      x: 50,
      y: 10,
    },
    description:
      "I can’t get enough compost for my own projects. There’s a black tub for drop-offs next to the garage—message me for more details.",
    accepted_items: ["Kitchen scraps", "Spent coffee", "Newspaper"],
    rejected_items: [
      "Fruit stickers",
      "Meat",
      "Fish",
      "So called ‘compostable’ bags",
    ],
  }),
  createDemoListing({
    owner_first_name: "Becca",
    type: "residential",
    avatar: "sunflowers.jpg",
    map_position: {
      x: -20,
      y: 45,
    },
    description:
      "Keen worm farmer. Please chop your scraps into small pieces for my worms’ little teeth. I sometimes have worm castings to give in exchange!",
    accepted_items: ["Chopped kitchen scraps"],
    rejected_items: ["Onion peels", "Limited amount of citrus"],
  }),
  createDemoListing({
    owner_first_name: "Lee",
    type: "residential",
    avatar: "mayo.jpg",
    map_position: {
      x: 10,
      y: -20,
    },
    description:
      "My chooks are always hungry for scraps! Especially watermelon...\nAnything they don’t eat will go in my compost heap.",
    accepted_items: ["Fruit and veg scraps", "Mulch", "Coffee grounds"],
    rejected_items: ["Meat and dairy", "Limited amounts of citrus"],
  }),
  createDemoListing({
    name: "Hoppin’ Mad Brewers",
    owner_first_name: "Gretel",
    type: "business",
    avatar: "brewery.jpg",
    map_position: {
      x: 30,
      y: -65,
    },
    description:
      "Spent grain and hops are available for collection most Wednesday afternoons.\nWe also sometimes have spare 10L buckets leftover from our brewing process.\nReach out for the latest availablity.",
  }),
];
