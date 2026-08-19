const router = require("express").Router();
const supportController = require("../controllers/supportController");

router.post("/contact", supportController.submitContact);

module.exports = router;
