import useRouter from 'express';
import * as articleController from "../../controllers/article.controller.js"
const router = useRouter.Router();

// Article routes
router.post("/create-articles", articleController.CreateArticle)
router.get("/get-all-articles", articleController.GetAllArticles)
router.get("/get-by-id-articles/:id", articleController.GetArticleById)
router.put("/update-articles/:id", articleController.UpdateArticle)
router.delete("/articles/:id", articleController.DeleteArticle)
router.patch("/articles/:id/toggle-status", articleController.ToggleArticleStatus)

export default router;
