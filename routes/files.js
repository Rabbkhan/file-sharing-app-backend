const multer = require("multer");
const router = require("express").Router();
const path = require("path");
const File = require("../models/file");
const { v4: uuidv4 } = require("uuid");

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()} -${Math.round(
      Math.random() * 1e9
    )} ${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
  
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 100000 * 100 },
}).single("myfile");

router.post("/", (req, res) => {
  //Store file
  upload(req, res, async (err) => {
    // Validate request
    if (!req.file) {
        return res.json({ error: "All fields are required" });
      }

    if (err) {
      console.log("Error:", err);
      return res.status(500).send({ error: err.message });
    }

    //Store in Database

    const file = new File({
      filename: req.file.filename,
      uuid: uuidv4(),
      path: req.file.path,
      size: req.file.size,
    });

    const response = await file.save();
    return res.json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
  });

  //Response -> Link
});

router.post("/send", async (req, res) => {
  //validate request

  const { uuid, emailTo, emailFrom } = req.body;

  //validate request

  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({ error: "All fields are required" });
  }

  //Get data from database

  const file = await File.findOne({ uuid: uuid });

  if (file.sender) {
    return res.status(422).send({ error: "Email already send." });
  }

  file.sender = emailFrom;
  file.receiver = emailTo;

  const response = await file.save();

  //send email

  const sendMail = require("../services/emailService");
  sendMail({
    from: emailFrom,
    to: emailTo,
    subject: "file sharing App",
    text: `${emailFrom} shared a file with you`,
    html: require("../services/emailTemplate")({
      emailFrom: emailFrom,
      downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
      size: parseInt(file.size / 1000) + "KB",
      expires: "24 hours",
    }),
  });
  return res.send({ success: "Email sent Succesfully!" });
});

module.exports = router;
