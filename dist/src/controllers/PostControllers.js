"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsAdmin = exports.updatePost = exports.deletePost = exports.updatePostStatus = exports.getPendingPosts = exports.getPosts = exports.getPostByID = exports.createPostAdmin = exports.createPost = void 0;
const validator_1 = __importDefault(require("validator"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const date = new Date();
//  user create post
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, tagNames, categories } = req.body;
    const authorId = req.user.id;
    const createdPost = yield prisma.post.create({
        data: {
            title,
            content,
            author: { connect: { id: authorId } },
            tags: {
                connectOrCreate: tagNames.map((tagName) => ({
                    create: { name: tagName },
                    where: { name: tagName },
                })),
            },
            categories: {
                connect: categories.map((e) => ({
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
});
exports.createPost = createPost;
/// just admin route can access
const createPostAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, tags, categories, authorID } = req.body;
    const createdPost = yield prisma.post.create({
        data: {
            title,
            content,
            author: {
                connect: { id: Number(authorID) ? Number(authorID) : req.user.id },
            },
            status: "approved",
            tags: {
                connectOrCreate: tags.map((e) => ({
                    where: { name: e },
                    create: { name: e },
                })),
            },
            categories: {
                connect: categories.map((e) => ({
                    id: e,
                })),
            },
        },
    });
    return res.status(200).json({
        data: createdPost,
    });
});
exports.createPostAdmin = createPostAdmin;
// update status of post - admin
const updatePostStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    const updatedPost = yield prisma.post.update({
        where: { id: Number(id) },
        data: { status },
    });
    return res.status(200).json({ data: updatedPost });
});
exports.updatePostStatus = updatePostStatus;
const getPostByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const idCheck = validator_1.default.isInt(id);
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
    const post = yield prisma.post.findUnique({
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
    const updatedPost = yield prisma.post.update({
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
});
exports.getPostByID = getPostByID;
/// those posts have been approved
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keySearch, limit, pageIndex, tagSearch, categorySearch } = req.query;
    const search = keySearch || "";
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
    const pagination = {
        take: Number(limit) || 10,
        skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
    };
    const [posts, totalCount] = yield Promise.all([
        prisma.post.findMany(Object.assign(Object.assign({}, pagination), { where: Object.assign(Object.assign({ OR: [
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
                ], status: "approved" }, tagSearchQuery), categorySearchQuery), include: {
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
            } })),
        prisma.post.count({
            where: Object.assign(Object.assign({ OR: [
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
                ], status: "approved" }, tagSearchQuery), categorySearchQuery),
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
});
exports.getPosts = getPosts;
// api get list posts needed to approved and having pending status
const getPendingPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keySearch, limit, pageIndex, tagSearch, categorySearch } = req.query;
    const search = keySearch || "";
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
    const pagination = {
        take: Number(limit) || 10,
        skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
    };
    const [posts, totalCount] = yield Promise.all([
        prisma.post.findMany(Object.assign(Object.assign({}, pagination), { where: Object.assign(Object.assign({ OR: [
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
                ], status: "pending" }, tagSearchQuery), categorySearchQuery), include: {
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
            } })),
        prisma.post.count({
            where: Object.assign(Object.assign({ OR: [
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
                ], status: "pending" }, tagSearchQuery), categorySearchQuery),
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
});
exports.getPendingPosts = getPendingPosts;
// Admin crud :
const getPostsAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keySearch, limit, pageIndex, tagSearch, categorySearch } = req.query;
    const search = keySearch || "";
    const tagSearchArray = (tagSearch || []).filter(Boolean);
    const categorySearchArray = (categorySearch || []).filter(Boolean);
    const tagSearchQuery = tagSearchArray.length > 0
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
    const categorySearchQuery = categorySearchArray.length > 0
        ? {
            categories: {},
        }
        : {};
    const pagination = {
        take: Number(limit) || 10,
        skip: ((Number(pageIndex) || 1) - 1) * (Number(limit) || 10),
    };
    const [posts, totalCount] = yield Promise.all([
        prisma.post.findMany(Object.assign(Object.assign({}, pagination), { where: Object.assign(Object.assign({ OR: [
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
                ] }, tagSearchQuery), categorySearchQuery), include: {
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
            } })),
        prisma.post.count({
            where: Object.assign(Object.assign({ OR: [
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
                ] }, tagSearchQuery), categorySearchQuery),
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
});
exports.getPostsAdmin = getPostsAdmin;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, content, tags, categories, authorId } = req.body;
    // Determine the role of the requester (user or admin)
    const { role } = req.user;
    const userId = req.user.id;
    const dataToUpdate = {
        tags,
        categories,
    };
    if (tags) {
        dataToUpdate.tags = {
            upsert: tags.map((tag) => ({
                where: { name: tag },
                update: {},
                create: { name: tag },
            })),
        };
    }
    if (categories) {
        dataToUpdate.categories = {
            upsert: categories.map((category) => ({
                where: { name: category },
                update: {},
                create: { name: category },
            })),
        };
    }
    const updatedPost = yield prisma.post.update({
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
});
exports.updatePost = updatePost;
// admin and user can delete
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield prisma.post.delete({
        where: { id: Number(id) },
    });
    res.status(204).send();
});
exports.deletePost = deletePost;
//# sourceMappingURL=PostControllers.js.map