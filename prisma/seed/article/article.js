const { ArticleType, Category } = require("@prisma/client");
const { remoteImageUrlToFile } = require("../serviceListing/serviceListing");
const s3ServiceInstance = require("../../../src/api/services/s3Service");
const ArticleService = require("../../../src/api/services/article/articleService");

const {
  ARTICLE_1_CONTENT,
  ARTICLE_2_CONTENT,
  ARTICLE_3_CONTENT,
  ARTICLE_4_CONTENT,
  ARTICLE_1_COMMENTS,
  ARTICLE_2_COMMENTS,
  ARTICLE_3_COMMENTS,
  ARTICLE_4_COMMENTS,
} = require("./data");

/*
      id: 1
      name: "Eco-friendly"
   
      id: 2
      name: "New"
  
      id: 3
      name: "Seasonal"

      id: 4
      name: "Exercise"

      id: 5
      name: "Adoption"
*/

const articleData = [
  {
    title: "Introducing the Latest Line of feline Purr-fect Products",
    content: ARTICLE_1_CONTENT,
    articleType: ArticleType.ANNOUNCEMENTS,
    isPinned: true,
    dateCreated: new Date("2023-11-13"),
    tagIds: [1, 2, 3],
    category: Category.PET_RETAIL,
    articleComments: ARTICLE_1_COMMENTS,
    url: "https://img.buzzfeed.com/buzzfeed-static/static/2021-05/6/14/asset/94036a0af5b2/sub-buzz-9814-1620311649-30.jpg",
  },
  {
    title: "Paws and Reflect: Hilarious Hacks for Outsmarting Your Clever Canine",
    content: ARTICLE_2_CONTENT,
    articleType: ArticleType.TIPS_AND_TRICKS,
    isPinned: false,
    dateCreated: new Date("2023-11-15"),
    tagIds: [2, 4],
    category: undefined,
    articleComments: ARTICLE_2_COMMENTS,
    url: "https://i.ebayimg.com/images/g/EfgAAOSwwz1foW~4/s-l1200.jpg",
  },
  {
    title: "New Partner Restaurant Opening!",
    content: ARTICLE_3_CONTENT,
    articleType: ArticleType.ANNOUNCEMENTS,
    isPinned: true,
    dateCreated: new Date(),
    tagIds: [2, 3],
    category: Category.DINING,
    articleComments: ARTICLE_3_COMMENTS,
    url: "https://media-cdn.tripadvisor.com/media/photo-s/23/9c/a4/0a/massive-turtle-about.jpg",
  },
  {
    title: "Fur-bulous Makeovers: Dress-up Hamsters",
    content: ARTICLE_4_CONTENT,
    articleType: ArticleType.EVENTS,
    isPinned: true,
    dateCreated: new Date("2023-11-16"),
    tagIds: [5],
    category: Category.PET_GROOMING,
    articleComments: ARTICLE_4_COMMENTS,
    url: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/fa116277-c9e5-46e3-b6f7-893e9ec17100/dfzm93x-d8fcf604-2adb-496c-a3a1-d9e54f6ea5fb.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2ZhMTE2Mjc3LWM5ZTUtNDZlMy1iNmY3LTg5M2U5ZWMxNzEwMFwvZGZ6bTkzeC1kOGZjZjYwNC0yYWRiLTQ5NmMtYTNhMS1kOWU1NGY2ZWE1ZmIuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.4NBZk8-4flIRIp78vxMYwwI8G9jSA4mxBRN7OeiEWqA",
  },
];

async function seedArticles(prisma) {
  const rootAdmin = await prisma.internalUser.findFirst({
    where: {
      firstName: "Root",
      lastName: "Administrator",
    },
  });

  for (const data of articleData) {
    const articleFiles = [];
    const file = await remoteImageUrlToFile(data.url, data.name);
    articleFiles.push(file);

    const key = await s3ServiceInstance.uploadImgFiles(articleFiles, "article");
    const url = await s3ServiceInstance.getObjectSignedUrl(key);

    await prisma.article.create({
      data: {
        title: data.title,
        articleType: data.articleType,
        content: data.content,
        isPinned: data.isPinned,
        dateCreated: data.dateCreated,
        category: data.category,
        attachmentUrls: url,
        attachmentKeys: key,
        tags: {
          connect: data.tagIds.map((tagId) => ({ tagId: tagId })),
        },
        createdBy: {
          connect: {
            userId: rootAdmin.userId,
          },
        },
        articleComments: {
          create: data.articleComments,
        },
      },
    });
  }
}

module.exports = { seedArticles };
