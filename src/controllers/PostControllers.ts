/* eslint-disable @typescript-eslint/no-explicit-any */
// import { ResponseBody } from "../types";
import { prisma } from "../../prisma/prisma";
import { TokenRequest } from "src/middlewares/Authentication";
import { Response } from "express";
import validator from "validator";
//  user create post
const createPost: any = async (req: TokenRequest, res: Response) => {
  const { authorId, title, content, tagNames } = req.body;
  console.log("req.body", req.body);
  console.log("req.user", req.user);

  //   const tagNames = req.body.tagNames as Array<string>;
  const createdPost = await prisma.post.create({
    data: {
      title,
      content,
      author: { connect: { id: authorId } },
      tags: {
        connectOrCreate: tagNames.map((e: string) => ({
          where: { name: e },
          create: { name: e },
        })),
      },
    },
  });
  return res.status(200).json({
    data: createdPost,
  });
};
/// just admin route can access
const createPostAdmin: any = async (req: TokenRequest, res: Response) => {
  const { title, content, tagNames } = req.body;

  const createdPost = await prisma.post.create({
    data: {
      title,
      content,
      author: { connect: { id: req.user.id } },
      status: "approved",
      tags: {
        connectOrCreate: tagNames.map((e: string) => ({
          where: { name: e },
          create: { name: e },
        })),
      },
    },
  });
  return res.status(200).json({
    data: createdPost,
  });
};
const getPostByID: any = async (req: TokenRequest, res: Response) => {
  const { id } = req.params;
  const idCheck = validator.isInt(id);
  if (!idCheck) {
    return res.status(422).json({
      errors: [
        {
          field: "id",
          message: "Invalid id",
        },
      ],
      message: "Invalid credentials",
    });
  }
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
        },
      },
      tags: true,
      categories: true,
    },
  });
  return res.status(200).json({
    data: post,
  });
};
/// those posts have been approved
const getPosts: any = async (req: TokenRequest, res: Response) => {
  const { keySearch, limit, pageIndex, tagSearch, categorySearch } =
    req.query as {
      keySearch?: string;
      limit?: string;
      pageIndex?: string;
      tagSearch?: string;
      categorySearch?: string;
    };

  const search: string = keySearch || "";
  const tagSearchQuery = tagSearch
    ? {
        tags: {
          some: {
            name: {
              contains: tagSearch,
            },
          },
        },
      }
    : {};

  const categorySearchQuery = categorySearch
    ? {
        categories: {
          some: {
            name: {
              contains: categorySearch,
            },
          },
        },
      }
    : {};
  const pagination: object = {
    take: Number(limit) || 10,
    skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
  };

  const posts = await prisma.post.findMany({
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
      ...tagSearchQuery,
      ...categorySearchQuery,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
        },
      },
      tags: true,
      categories: true,
    },
  });
  return res.status(200).json(posts);
};
// api get list posts needed to approved and having pending status
const getPendingPosts: any = async (req: TokenRequest, res: Response) => {
  const { keySearch, limit, pageIndex, tagSearch, categorySearch } =
    req.query as {
      keySearch?: string;
      limit?: string;
      pageIndex?: string;
      tagSearch?: string;
      categorySearch?: string;
    };

  const search: string = keySearch || "";
  const tagSearchQuery = tagSearch
    ? {
        tags: {
          some: {
            name: {
              contains: tagSearch,
            },
          },
        },
      }
    : {};

  const categorySearchQuery = categorySearch
    ? {
        categories: {
          some: {
            name: {
              contains: categorySearch,
            },
          },
        },
      }
    : {};

  const pagination: object = {
    take: Number(limit) || 10,
    skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
  };

  const posts = await prisma.post.findMany({
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
      status: "pending",
      ...tagSearchQuery,
      ...categorySearchQuery,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
        },
      },
      tags: true,
      categories: true,
    },
  });
  return res.status(200).json(posts);
};
export { createPost, createPostAdmin, getPostByID, getPosts, getPendingPosts };
