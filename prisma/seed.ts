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
          content: `## Explore the Enchanting City of Hanoi

          ![Hanoi Cityscape](https://vietnamtravel.com/images/2020/06/Intro-Hanoi-Vietnam.jpg)
          
          Welcome to Hanoi, the capital city of Vietnam, where ancient traditions blend harmoniously with modern life. Hanoi is known for its rich history, vibrant culture, and delicious cuisine. Let's dive into some of the must-see attractions and experiences in this enchanting city.
          
          ## Old Quarter - A Historical Gem
          
          The **Old Quarter** in Hanoi is a maze of narrow streets dating back to the 13th century. Explore the bustling streets, each named after the trade that used to take place there. You'll find traditional shops, street vendors selling tasty snacks, and an array of colorful markets.
          
          ![image](https://baotangphunu.org.vn/wp-content/uploads/2020/03/phoco.jpg)
          
          ## Hoan Kiem Lake and Ngoc Son Temple
          
          **Hoan Kiem Lake**, also known as the "Lake of the Restored Sword," is a picturesque spot right in the heart of Hanoi. Take a leisurely stroll around the lake and visit the **Ngoc Son Temple** on an island in the center. Legend has it that the lake is home to a giant turtle.
          ![Hanoi Cityscape](https://asianwaytravel.com/wp-content/uploads/2018/10/hanoi-hoan-kiem-e1541473022948.jpg)
          
          
          ## The Imperial Citadel of Thang Long
          
          Discover the history of Vietnam at the **Imperial Citadel of Thang Long**, a UNESCO World Heritage Site. Explore the ancient ruins, gates, and relics that date back to the 11th century. It's a fascinating journey through time.
          
          ![Hanoi Cityscape](https://upload.wikimedia.org/wikipedia/commons/0/0f/Central_Sector_of_the_Imperial_Citadel_of_Thang_Long_-_Hanoi.jpg)
          
          
          ## Enjoy Traditional Vietnamese Cuisine
          
          Hanoi is renowned for its delicious street food and traditional dishes. Don't miss trying **pho** (noodle soup), **bun cha** (grilled pork with noodles), and **banh mi** (Vietnamese sandwich) from local street vendors.
          
          ![image](https://icdn.dantri.com.vn/thumb_w/640/2019/02/28/13-1551316637399.jpg)
          
          ## Water Puppet Theatre
          
          Experience a unique cultural show at the **Thang Long Water Puppet Theatre**. Traditional water puppetry is an art form that originated in the Red River Delta, and it's a captivating performance that's worth watching.
          
          ![image](https://media.tacdn.com/media/attractions-splice-spp-674x446/09/ac/97/07.jpg)
          
          ## Day Trip to Halong Bay
          
          While in Hanoi, consider taking a day trip to **Halong Bay**, a UNESCO World Heritage Site. Marvel at the stunning limestone karsts and emerald waters on a boat tour. It's a breathtaking natural wonder just a few hours from the city.
          
          ## Final Thoughts
          
          Hanoi is a city that beautifully blends history, culture, and modernity. From its ancient streets to its delicious cuisine, there's something for every traveler to enjoy. Plan your trip to Hanoi and immerse yourself in the charm of this captivating city.
          
          *Remember to respect the local customs and traditions during your visit, and enjoy your journey through the heart of Vietnam!*
           `,
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
  for (let index = 3; index < 5001; index++) {
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
    console.log(`Created category with ID: ${category.id}`);
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
    // await seedUsers();
    // await seedPosts();
    // await seedCategory();
    await seedTags();
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
