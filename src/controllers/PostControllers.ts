/* eslint-disable @typescript-eslint/no-explicit-any */
// import { ResponseBody } from "../types";
// import { prisma } from "../../prisma/prisma";
import { TokenRequest } from "src/middlewares/Authentication";
import { Response } from "express";
import validator from "validator";
import { PrismaClient, Prisma } from "@prisma/client";
import { client } from "../redis";
const prisma = new PrismaClient();
const date = new Date();

//  user create post
const createPost: any = async (req: TokenRequest, res: Response) => {
  const { title, content, tagNames, categories } = req.body;
  const authorId = req.user.id;
  const createdPost = await prisma.post.create({
    data: {
      title,
      content,
      author: { connect: { id: authorId } },
      tags: {
        connectOrCreate: tagNames.map((tagName: string) => ({
          create: { name: tagName },
          where: { name: tagName },
        })),
      },
      categories: {
        connect: categories.map((e: number) => ({
          id: e,
        })),
      },
    },
    include: {
      tags: true,
      categories: true,
    },
  });
  return res.status(200).json({
    data: createdPost,
  });
};
/// just admin route can access
const createPostAdmin: any = async (req: TokenRequest, res: Response) => {
  const { title, content, tags, categories, authorID } = req.body as {
    title: string;
    content: string;
    tags: any;
    categories: any;
    authorID?: string;
  };

  const createdPost = await prisma.post.create({
    data: {
      title,
      content,
      author: {
        connect: { id: Number(authorID) ? Number(authorID) : req.user.id },
      },
      status: "approved",
      tags: {
        connectOrCreate: tags.map((e: string) => ({
          where: { name: e },
          create: { name: e },
        })),
      },
      categories: {
        connect: categories.map((e: number) => ({
          id: e,
        })),
      },
    },
  });
  return res.status(200).json({
    data: createdPost,
  });
};
// update status of post - admin
const updatePostStatus: any = async (req: TokenRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedPost = await prisma.post.update({
    where: { id: Number(id) },
    data: { status },
  });

  return res.status(200).json({ data: updatedPost });
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
  if (!post) {
    return res.status(404).json({
      message: "Post not found",
    });
  }

  // Increment the view count
  const updatedPost = await prisma.post.update({
    where: { id: parseInt(id) },
    data: {
      views: {
        increment: 1,
      },
    },
  });
  return res.status(200).json({
    data: updatedPost,
  });
};

const getPosts: any = async (req: TokenRequest, res: Response) => {
  const { keySearch, limit, pageIndex, tagSearch, categorySearch } =
    req.query as {
      keySearch?: string;
      limit?: string;
      pageIndex?: string;
      tagSearch?: string;
      categorySearch?: string;
    };
  const cacheKey = `posts:${JSON.stringify(req.query)}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    // If cached data exists, return it
    const parsedData = JSON.parse(cachedData);
    return res.status(200).json(parsedData);
  }
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

  const [posts, totalCount] = await Promise.all([
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
    }),
    prisma.post.count({
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
    }),
  ]);

  const totalPage = Math.ceil(totalCount / (Number(limit) || 10));
  await client.set(
    cacheKey,
    JSON.stringify({ posts, pageIndex, totalPage, limit, keySearch }),
    { EX: 3600 },
  ); // Cache for 1 hour (3600 seconds)
  return res.status(200).json({
    posts,
    pageIndex: Number(pageIndex) || 1,
    totalPage,
    limit: Number(limit) || 10,
    keySearch,
  });
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

  const [posts, totalCount] = await Promise.all([
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
    }),
    prisma.post.count({
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
    }),
  ]);

  const totalPage = Math.ceil(totalCount / (Number(limit) || 10));

  return res.status(200).json({
    posts,
    pageIndex: Number(pageIndex) || 1,
    totalPage,
    limit: Number(limit) || 10,
    keySearch,
  });
};
// Admin crud :
const getPostsAdmin: any = async (req: TokenRequest, res: Response) => {
  const { keySearch, limit, pageIndex, tagSearch, categorySearch } =
    req.query as {
      keySearch?: string;
      limit?: string;
      pageIndex?: string;
      tagSearch?: Array<string>;
      categorySearch?: string[];
    };

  const search: string = keySearch || "";
  const tagSearchArray = (tagSearch || []).filter(Boolean);
  const categorySearchArray = (categorySearch || []).filter(Boolean);
  const tagSearchQuery =
    tagSearchArray.length > 0
      ? {
          tags: {
            some: {
              name: {
                in: tagSearchArray,
              },
            },
          },
        }
      : {};

  const categorySearchQuery =
    categorySearchArray.length > 0
      ? {
          categories: {},
        }
      : {};

  const pagination: object = {
    take: Number(limit) || 10,
    skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
  };

  const [posts, totalCount] = await Promise.all([
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
        tags: {
          select: {
            name: true,
          },
        },
        categories: true,
      },
    }),
    prisma.post.count({
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
        ...tagSearchQuery,
        ...categorySearchQuery,
      },
    }),
  ]);

  const totalPage = Math.ceil(totalCount / (Number(limit) || 10));

  return res.status(200).json({
    posts,
    pageIndex: Number(pageIndex) || 1,
    totalPage,
    limit: Number(limit) || 10,
    keySearch,
    totalCount,
  });
};
const updatePost: any = async (req: TokenRequest, res: Response) => {
  const { id } = req.params;
  const { title, content, tags, categories, authorId } = req.body as {
    title: string;
    content: string;
    tags: any;
    categories: any;
    authorId?: number;
  };
  // Determine the role of the requester (user or admin)

  const { role } = req.user;
  const userId = req.user.id;
  const dataToUpdate = {
    tags,
    categories,
  };

  if (tags) {
    dataToUpdate.tags = {
      upsert: tags.map((tag: string) => ({
        where: { name: tag },
        update: {},
        create: { name: tag },
      })),
    };
  }

  if (categories) {
    dataToUpdate.categories = {
      upsert: categories.map((category: string) => ({
        where: { name: category },
        update: {},
        create: { name: category },
      })),
    };
  }

  const updatedPost = await prisma.post.update({
    where: { id: Number(id) },
    data: {
      title: title,
      content: content,
      status: role === "admin" ? "approved" : "pending",
      tags: dataToUpdate.tags,
      categories: dataToUpdate.categories,
      authorId: role === "admin" ? authorId : userId,
      updated_at: date.toISOString(),
    },
    include: {
      tags: true,
      categories: true,
    },
  });

  return res.status(200).json(updatedPost);
};

// admin and user can delete
const deletePost: any = async (req: TokenRequest, res: Response) => {
  const { id } = req.params;

  await prisma.post.delete({
    where: { id: Number(id) },
  });

  res.status(204).send();
};
const getTopViewedPosts: any = async (req: TokenRequest, res: Response) => {
  const { limit } = req.query as {
    limit?: string;
  };

  const cacheKey = `topViewedPosts:${limit}`;
  const cachedData = await client.get(cacheKey);

  if (cachedData) {
    // If cached data exists, return it
    const parsedData = JSON.parse(cachedData);
    return res.status(200).json(parsedData);
  }

  const topViewedPosts = await prisma.post.findMany({
    take: Number(limit) || 10, // You can specify the number of top posts to retrieve
    where: {
      status: "approved",
    },
    orderBy: {
      views: "desc",
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

  await client.set(cacheKey, JSON.stringify(topViewedPosts), { EX: 3600 });

  return res.status(200).json(topViewedPosts);
};

export {
  createPost,
  createPostAdmin,
  getPostByID,
  getPosts,
  getPendingPosts,
  updatePostStatus,
  deletePost,
  updatePost,
  getPostsAdmin,
  getTopViewedPosts,
};
