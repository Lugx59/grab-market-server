const express = require('express');
const cors = require('cors');
const app = express();
const models = require('./models');
const multer = require('multer');
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'upload/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    },
  }),
});
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use('/upload', express.static('upload'));

/* 슬라이드 배너 */
app.get('/banners', (req, res) => {
  models.Banner.findAll({
    limit: 2
  }).then((result) => {
    res.send({
      banners: result,
    })
  }).catch((error) => {
    console.error(error);
    res.status(500).send('에러가 발생했습니다.');
  })
})

/* 정렬 쿼리 */
app.get("/products", (req, res) => {
  models.product.findAll({
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'name', 'price', 'createdAt', 'seller', 'imageUrl', "soldout"], /* 필요한 정보만 가져오는 쿼리 */
  }).then((result) => {
    console.log("PRODUCTS : ", result);
    res.send({
      products: result
    })
  }).catch((error) => {
    console.error(error);
    res.status(400).send("에러 발생");
  });
})

/* name, description, price, seller 중에 하나라도 빠진 것을 검사하는 쿼리 */
app.post("/products", (req, res) => {
  const body = req.body;
  const { name, description, price, seller, imageUrl } = body;
  if (!name || !description || !price || !seller || !imageUrl) {
    res.status(400).send("모든 필드를 입력해주세요.")
  }
  models.product.create({
    name,
    description,
    price,
    seller,
    imageUrl,
  })
    .then((result) => {
      console.log("상품 생성 결과 : ", result)
      res.send({
        result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(400).send("상품 업로드에 문제가 발생했습니다.");
    });
});


/* id 중에 하나만 조회하는 쿼리 */
app.get("/products/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  models.product.findOne({
    where: {
      id: id
    }
  }).then((result) => {
    console.log("PRODUCT : ", result);
    res.send({
      product: result
    })
  }).catch((error) => {
    console.error(error)
    res.status(400).send("상품 조회에 에러가 발생했습니다.")
  })
});

/* 이미지 업로드 쿼리 */
app.post('/image', upload.single('image'), (req, res) => {
  const file = req.file;
  console.log(file)
  res.send({
    imageUrl: file.path,
  })
})

/* 결제하기 */
app.post("/purchase/:id", (req, res) => {
  const { id } = req.params;
  models.product.update(
    {
      soldout: 1,
    },
    {
      where: {
        id,
      },
    }).then((result) => {
      res.send({
        result: true,
      })
    }).catch((error) => {
      res.status(500).send('에러가 발생했습니다.');
    })
});

app.listen(port, () => {
  console.log("그랩의 쇼핑몰 서버가 돌아가고 있습니다.")
  models.sequelize.sync().then(() => {
    console.log('DB 연결 성공!');
  }).catch((err) => {
    console.error(err);
    console.log('DB 연결 에러ㅠ');
    process.exit();
  })
})