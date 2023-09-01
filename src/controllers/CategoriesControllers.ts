/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../prisma/prisma";
import { TokenRequest } from "src/middlewares/Authentication";
import { Response } from "express";
// import validator from "validator";
const createCategories: any = async (req: TokenRequest, res: Response) => {
  const { name } = req.body;
  const createdCategory = await prisma.category.create({
    data: {
      name: name,
    },
  });
  return res.status(200).json(createdCategory);
};
const getCategories: any = async (req: TokenRequest, res: Response) => {
  const { keySearch, limit, pageIndex } = req.query as {
    keySearch?: string;
    limit?: string;
    pageIndex?: string;
  };

  const search: string = keySearch || "";

  const pagination: object = {
    take: Number(limit) || 10,
    skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
  };

  const [categories, totalCount] = await Promise.all([
    prisma.category.findMany({
      ...pagination,
      where: {
        name: {
          contains: search,
        },
      },
      include: {
        posts: {
          select: {
            id: true,
            // status: "approved",
            status: true,
          },
        },
      },
    }),
    prisma.category.count({
      where: {
        name: {
          contains: search,
        },
      },
    }),
  ]);
  const NumberOfPostsPerCat = categories.map((category) => {
    return {
      ...category,
      postCount: category.posts.length, // Add post count per category
    };
  });
  const totalPage = Math.ceil(totalCount / (Number(limit) || 10));

  return res.status(200).json({
    NumberOfPostsPerCat,
    pageIndex: Number(pageIndex) || 1,
    totalPage,
    limit: Number(limit) || 10,
    keySearch,
  });
};
const getCategoryPosts: any = async (req: TokenRequest, res: Response) => {
  const { id } = req.params;
  const { limit, pageIndex, keySearch } = req.query as {
    limit?: string;
    pageIndex?: string;
    keySearch?: string;
  };

  //   if (validator.isInt(id)) {
  //     return res.status(400).json({ message: "Invalid category ID." });
  //   }
  const search: string = keySearch || "";

  const pagination: object = {
    take: Number(limit) || 10,
    skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
  };

  const [category, posts] = await Promise.all([
    prisma.category.findUnique({
      where: {
        id: Number(id),
      },
    }),
    prisma.post.findMany({
      ...pagination,
      where: {
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            content: {
              contains: search,
            },
          },
        ],
        status: "approved",
        categories: {
          some: {
            id: Number(id),
          },
        },
      },
    }),
  ]);

  if (!category) {
    return res.status(404).json({ message: "Category not found." });
  }

  return res.status(200).json({
    category,
    posts,
    pageIndex: Number(pageIndex) || 1,
    limit: Number(limit) || 10,
    keySearch,
  });
};
export { getCategories, getCategoryPosts, createCategories };
