import useRouter from 'express';
import * as articleController from "../../controllers/article.controller.js"
const router = useRouter.Router();

// Article routes
router.post("/create-articles", articleController.CreateArticle)
router.get("/get-all-articles", articleController.GetAllArticles)
router.get("/author-all-articles", articleController.AuthorAllArticles)
router.get("/get-by-id-articles/:id", articleController.GetArticleById)
router.put("/update-articles/:id", articleController.UpdateArticle)
router.delete("/delete-articles/:id", articleController.DeleteArticle)
router.put("/update-articles-status/:id", articleController.ToggleArticleStatus)

export default router;
