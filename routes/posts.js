import express from "express";
//prettier-ignore
import { getPostsBySearch, getPosts, getPost, createPost, updatePost, deletePost, likePost, commentPost} from "../controllers/posts.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/search", getPostsBySearch);
router.get("/", getPosts);
router.get("/:id", getPost);

router.post("/", auth, createPost);
router.patch("/:id", auth, updatePost);
router.patch("/:id/like", auth, likePost);
router.delete("/:id", auth, deletePost);
router.post('/:id/commentPost', auth, commentPost);

export default router;
