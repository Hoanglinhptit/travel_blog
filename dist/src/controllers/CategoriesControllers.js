"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategory = exports.deleteCategory = exports.createCategories = exports.getCategoryPosts = exports.getCategories = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const prisma_1 = require("../../prisma/prisma");
// import validator from "validator";
const createCategories = async (req, res) => {
    const { name } = req.body;
    const createdCategory = await prisma_1.prisma.category.create({
        data: {
            name: name,
        },
    });
    return res.status(200).json(createdCategory);
};
exports.createCategories = createCategories;
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    // Determine the role of the requester (user or admin)
    const updatedTags = await prisma_1.prisma.category.update({
        where: { id: Number(id) },
        data: {
            name: name,
        },
    });
    return res.status(200).json(updatedTags);
};
exports.updateCategory = updateCategory;
const getCategories = async (req, res) => {
    const { keySearch, limit, pageIndex } = req.query;
    const search = keySearch || "";
    const pagination = {
        take: Number(limit) || 10,
        skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
    };
    const [categories, totalCount] = await Promise.all([
        prisma_1.prisma.category.findMany(Object.assign(Object.assign({}, pagination), { where: {
                name: {
                    contains: search,
                },
            }, include: {
                posts: {
                    select: {
                        id: true,
                        // status: "approved",
                        status: true,
                    },
                },
            } })),
        prisma_1.prisma.category.count({
            where: {
                name: {
                    contains: search,
                },
            },
        }),
    ]);
    const NumberOfPostsPerCat = categories.map((category) => {
        return Object.assign(Object.assign({}, category), { postCount: category.posts.length });
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
exports.getCategories = getCategories;
const getCategoryPosts = async (req, res) => {
    const { id } = req.params;
    const { limit, pageIndex, keySearch } = req.query;
    //   if (validator.isInt(id)) {
    //     return res.status(400).json({ message: "Invalid category ID." });
    //   }
    const search = keySearch || "";
    const pagination = {
        take: Number(limit) || 10,
        skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
    };
    const [category, posts] = await Promise.all([
        prisma_1.prisma.category.findUnique({
            where: {
                id: Number(id),
            },
        }),
        prisma_1.prisma.post.findMany(Object.assign(Object.assign({}, pagination), { where: {
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
            } })),
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
exports.getCategoryPosts = getCategoryPosts;
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.category.delete({
        where: { id: Number(id) },
    });
    res.status(204).send();
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=CategoriesControllers.js.map