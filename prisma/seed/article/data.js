const fs = require("fs");
const path = require("path");

function readArticleContent(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error("Error reading file:", err);
    return null;
  }
}

const ARTICLE_1_CONTENT = readArticleContent("./prisma/seed/article/article1.txt");
const ARTICLE_2_CONTENT = readArticleContent("./prisma/seed/article/article2.txt");
const ARTICLE_3_CONTENT = readArticleContent("./prisma/seed/article/article3.txt");
const ARTICLE_4_CONTENT = readArticleContent("./prisma/seed/article/article4.txt");

const ARTICLE_1_COMMENTS = [
  {
    petOwnerId: 9,
    comment: "Loved the section on composting. It's a game-changer for reducing kitchen waste!",
  },
  { petOwnerId: 10, comment: "Can you recommend eco-friendly brands for household cleaning?" },
  {
    petOwnerId: 9,
    comment:
      "This article is an eye-opener. Planning to start a zero-waste challenge. Elevate your zoo adventure with ZooVanna — an innovative management system designed to optimize animal care, resource allocation, and visitor engagement. Seamlessly integrating IoT, machine learning, and more, it offers exciting features like realistic animal enclosure design, customized animal feeding plans, and animal population monitoring and management. For visitors, it provides crowd control analysis, QR ticketing, a secured payment gateway, and itinerary advisory. Our dedicated team specializes in tailoring solutions to address unique zoo challenges while contributing to global conservation.",
  },
];

const ARTICLE_2_COMMENTS = [
  {
    petOwnerId: 9,
    comment: "Just adopted a rescue cat and this advice is a lifesaver. Thank you!",
  },
  {
    petOwnerId: 10,
    comment:
      "Anyone else in love with their energetic puppy? Need tips on managing their boundless energy! Heartwarming story about the dog shelter. It's inspiring to see the community come together for pets in need. Can you share some healthy homemade treat recipes for dogs? I've been volunteering at a local animal shelter and it's been an amazing experience. This article resonates with me.",
  },
  {
    petOwnerId: 9,
    comment:
      "Heartwarming story about the dog shelter. It's inspiring to see the community come together for pets in need.",
  },
  { petOwnerId: 9, comment: "Can you share some healthy homemade treat recipes for dogs?" },
  {
    petOwnerId: 10,
    comment:
      "Anyone else in love with their energetic puppy? Need tips on managing their boundless energy! Heartwarming story about the dog shelter. It's inspiring to see the community come together for pets in need. Can you share some healthy homemade treat recipes for dogs? I've been volunteering at a local animal shelter and it's been an amazing experience. This article resonates with me.",
  },
  {
    petOwnerId: 9,
    comment: "Adopt, don't shop! It's incredible to see how many lives are changed through adoption.",
  },
  {
    petOwnerId: 10,
    comment: "This article made me appreciate my furry friend even more. Pets truly are family.",
  },
  {
    petOwnerId: 9,
    comment:
      "Anyone else in love with their energetic puppy? Need tips on managing their boundless energy! Heartwarming story about the dog shelter. It's inspiring to see the community come together for pets in need. Can you share some healthy homemade treat recipes for dogs? I've been volunteering at a local animal shelter and it's been an amazing experience. This article resonates with me.",
  },
  {
    petOwnerId: 10,
    comment: "What are some effective ways to deal with pet anxiety during thunderstorms?",
  },
  {
    petOwnerId: 9,
    comment: "I'm considering adopting a senior pet. Would love to read more about caring for older animals.",
  },
];

const ARTICLE_3_COMMENTS = [];

const ARTICLE_4_COMMENTS = [
  {
    petOwnerId: 10,
    comment:
      "There's something inherently off-putting about the sight of a hamster dolled up in a dress, a spectacle that nudges the boundaries of pet fashion a tad too far. It's like watching a fluffy, innocent creature being thrust into the human world of vanity and frivolity, which just doesn't sit right. These tiny furballs are born to scamper and burrow, not to be smothered in fabric and frills that hinder their natural movements. I can't help but feel that dressing them up in such attire is more for human amusement than any comfort or benefit to the hamster. It's akin to forcing a square peg into a round hole - an unnecessary and slightly absurd endeavor that takes away from the simple, unadorned charm of these adorable creatures.?",
  },
  {
    petOwnerId: 9,
    comment:
      "There's an undeniable charm in seeing hamsters decked out in little dresses, bringing a smile and a dash of whimsy to our day. These tiny, sartorial moments seem to celebrate the cuteness of our furry friends, elevating their adorableness to new heights. When a hamster is comfortably dressed in a well-fitted, lightweight dress, it can almost seem like they're enjoying the attention and the pampering. It's like they're tiny, fuzzy models on a runway, showcasing a playful and innocent side of pet fashion. This delightful scene creates a bonding moment between pets and their owners, a shared experience filled with laughter and affection, capturing the joy and silliness of pet companionship.",
  },
];

module.exports = {
  ARTICLE_1_CONTENT,
  ARTICLE_2_CONTENT,
  ARTICLE_3_CONTENT,
  ARTICLE_4_CONTENT,
  ARTICLE_1_COMMENTS,
  ARTICLE_2_COMMENTS,
  ARTICLE_3_COMMENTS,
  ARTICLE_4_COMMENTS,
};
