import express from "express";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;

const uploadDir = "uploads/";
const thumbDir = path.join(uploadDir, "thumb");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  if (allowed.test(ext) && allowed.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("이미지 파일만 업로드할 수 있습니다"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.post("/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "파일이 없습니다" });

  const { filename, path: filePath } = req.file;

  const baseName = path.parse(filename).name;
  const thumbnailPngName = `thumb-${baseName}.png`;
  const thumbnaulPath = path.join(thumbDir, thumbnailPngName);

  const width = parseInt(req.query.width) || 100;
  const height = parseInt(req.query.height) || 100;

  try {
    await sharp(filePath).resize(width.height).png().toFile(thumbnaulPath);

    res.json({
      message: "업로드 및 png 썸네일 생성 성공",
      original: `/upload/${filename}`,
      thumbnail: `/upload/thumb/${thumbnailPngName}`,
      size: `${width}*${height}`,
    });
  } catch (err) {}
});

app.listen(port, () => {
  console.log(`${port}번으로 서버 실행 중`);
});
