import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const seedPosts = async () => {
  try {
    for (let i = 3727; i <= 8000; i++) {
      const post = await prisma.post.create({
        data: {
          title: `Post - ${i}`,
          content: `# This is the content of Post ${i}.  `,
          authorId: Number(i),
          // tags: {
          //   connectOrCreate: [
          //     {
          //       where: { name: "#VIETNAMESE" },
          //       create: { name: "#VIETNAMESE" },
          //     },
          //     {
          //       where: { name: "#ASIA" },
          //       create: { name: "#ASIA" },
          //     },
          //     {
          //       where: { name: "#FOOD" },
          //       create: { name: "#FOOD" },
          //     },
          //     {
          //       where: { name: "#STREETFOOD" },
          //       create: { name: "#STREEFOOD" },
          //     },
          //     {
          //       where: { name: "#LOCAL" },
          //       create: { name: "#LOCAL" },
          //     },
          //   ],
          // },
        },
      });
      console.log(`Created post with ID: ${post.id}`);
    }
  } catch (error) {
    console.log(error);
  }
};
const seedUsers = async () => {
  for (let index = 3000; index < 9000; index++) {
    const hashPassword = await bcrypt.hash("user", 10);

    const user = await prisma.users.create({
      data: {
        email: `author${index}@post.vn`,
        password: hashPassword,
        name: `${faker.person.fullName()}`,
      },
    });
    console.log(`Created user with ID: ${user.id}`);
  }
};
const seedCategory = async () => {
  for (let index = 1; index < 102; index++) {
    const category = await prisma.category.create({
      data: {
        name: faker.location.city(),
      },
    });
    console.log(`Created user with ID: ${category.id}`);
  }
};
const seedTags = async () => {
  for (let index = 1; index < 1200; index++) {
    const tag = await prisma.tags.create({
      data: {
        name: `#${faker.location.city().toUpperCase()}`,
      },
    });
    console.log(`Created tags with ID: ${tag.id}`);
  }
};

const main = async () => {
  try {
    await seedUsers();
    // await seedPosts();
    // await seedCategory();
    // await seedTags();
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
