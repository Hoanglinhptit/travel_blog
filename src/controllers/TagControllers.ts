/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { TokenRequest } from "src/middlewares/Authentication";
import { Response } from "express";
// import validator from "validator";
const createTags: any = async (req: TokenRequest, res: Response) => {
  const { name } = req.body;
  const createdCategory = await prisma.tags.create({
    data: {
      name: name,
    },
  });
  return res.status(200).json(createdCategory);
};
const updateTags: any = async (req: TokenRequest, res: Response) => {
  const { id } = req.params;
  const { name } = req.body as {
    name: string;
  };
  // Determine the role of the requester (user or admin)

  const updatedTags = await prisma.tags.update({
    where: { id: Number(id) },
    data: {
      name: name,
    },
  });

  return res.status(200).json(updatedTags);
};
const getTags: any = async (req: TokenRequest, res: Response) => {
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

  const [tags, totalCount] = await Promise.all([
    prisma.tags.findMany({
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
    prisma.tags.count({
      where: {
        name: {
          contains: keySearch,
        },
      },
    }),
  ]);
  const NumberOfPostsPerTag = tags.map((tag) => {
    return {
      ...tag,
      postCount: tag.posts.length, // Add post count per category
    };
  });
  const totalPage = Math.ceil(totalCount / (Number(limit) || 10));

  return res.status(200).json({
    NumberOfPostsPerTag,
    pageIndex: Number(pageIndex) || 1,
    totalPage,
    limit: Number(limit) || 10,
    keySearch,
  });
};
const getTagsPosts: any = async (req: TokenRequest, res: Response) => {
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

  const [tags, posts] = await Promise.all([
    prisma.tags.findUnique({
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

  if (!tags) {
    return res.status(404).json({ message: "Tag not found." });
  }

  return res.status(200).json({
    tags,
    posts,
    pageIndex: Number(pageIndex) || 1,
    limit: Number(limit) || 10,
    keySearch,
  });
};
const deleteTag: any = async (req: TokenRequest, res: Response) => {
  const { id } = req.params;

  await prisma.tags.delete({
    where: { id: Number(id) },
  });

  res.status(204).send();
};
export { getTags, getTagsPosts, createTags, deleteTag, updateTags };
