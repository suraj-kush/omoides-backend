import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";

export const getPosts = async (req, res) => {
  const { page } = req.query;
  try {
    const LIMIT = 8;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await PostMessage.countDocuments({});

    const posts = await PostMessage.find({})
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);
    res.status(200).json({
      data: posts,
      currentPage: Number(page),
      totalPages: Math.ceil(total / LIMIT),
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

export const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await PostMessage.findById(id);
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;

  try {
    const title = new RegExp(searchQuery, "i");
    const posts = await PostMessage.find({
      $or: [{ title }, { tags: { $in: tags.split(",") } }],
    });
    res.status(200).json({ data: posts });
  } catch (err) {
    res.status(404).json({
      message: err,
    });
  }
};

export const createPost = async (req, res) => {
  const post = req.body;

  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log(error);
  }
};
export const updatePost = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    message,
    creator,
    name,
    selectedFile,
    tags,
    likes,
    createdAt,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with id: ${id}`);

  const updatePost = {
    creator,
    name,
    title,
    message,
    tags,
    selectedFile,
    _id: id,
    likes,
    createdAt,
  };

  await PostMessage.findByIdAndUpdate(id, updatePost, { new: true });

  res.json(updatePost);
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with id: ${id}`);

  await PostMessage.findByIdAndRemove(id);
  console.log("Deleted");
  res.json({ message: "Post deleted successfully." });
};

export const likePost = async (req, res) => {
  const { id } = req.params;
  if (!req.userId) return res.status(401).send("Please authenticate");

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with id: ${id}`);

  const post = await PostMessage.findById(id);
  const index = post.likes.findIndex((id) => id === String(req.userId));

  if (index === -1) {
    post.likes.push(req.userId);
  } else {
    post.likes.splice(index, 1);
  }
  const updatePost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });
  res.json(updatePost);
};

export const commentPost = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  const post = await PostMessage.findById(id);
  console.log(post.comments);
  post.comments.push(comment);

  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });

  res.json(updatedPost);
};
