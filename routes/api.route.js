const router = require('express').Router();
const { PrismaClient } = require('@prisma/client')

// TO DO: ensure only single instance of prisma is created application start up
const prisma = new PrismaClient()

router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

router.get('/products/', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    })

    res.status(200).json(products)
  } catch (error) {
    next(error)
  }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params // TO-DO validate id
    const product = await prisma.product.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        category: true
      }
    })

    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
});

router.post('/products', async (req, res, next) => {
  try {
    const product = await prisma.product.create({
      data: req.body,
    })

    res.status(200).json(product);
  } catch (error) {
    next(error)
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params // TO-DO validate id
    const product = await prisma.product.delete({
      where: {
        id: Number(id)
      }
    })

    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
});

router.patch('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const toUpdate = req.body
    const product = await prisma.product.update({
      where: {
        id: Number(id)
      },
      data: req.body,
      include: {
        category: true
      }
    })

    res.status(200).json(product)
  } catch (error) {
    next(error)
  }
});


module.exports = router;
