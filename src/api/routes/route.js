const router = require('express').Router();
const { PrismaClient } = require('@prisma/client')

// TO DO: ensure only single instance of prisma is created application start up
const prisma = new PrismaClient()

const bcrypt = require('bcrypt');

router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

// USER MANAGEMENT APIS

/*
Get the list of all types of users
*/
router.get('/users/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany()

    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
});

/*
Get the list of all admins
*/
router.get('/applicationAdmin/', async (req, res, next) => {
  try {
    const admins = await prisma.applicationAdmin.findMany({
      include: {
        user: true,
      },
    });

    res.status(200).json(admins)
  } catch (error) {
    next(error)
  }
});

/*
Get the list of all petowners
*/
router.get('/petOwners', async (req, res, next) => {
  try {
    const petOwners = await prisma.petOwner.findMany({
      include: {
        user: true,
      },
    });

    res.status(200).json(petOwners);
  } catch (error) {
    next(error);
  }
});


/*
Get the list of all business owner
*/
router.get('/petBusiness', async (req, res, next) => {
  try {
    const petBusiness = await prisma.petBusiness.findMany({
      include: {
        user: true,
      },
    });

    res.status(200).json(petBusiness);
  } catch (error) {
    next(error);
  }
});

/*
Create Admin Account

TODO [jordan]: password hashing

// NOTE: Not sure if should be doing the create this way using "create:{}"
Request Body Schema:
{
  "firstName": "John",
  "lastName": "Doe",
  "adminRole": "ADMINISTRATOR",
  "user": {
    "create": {
      "email": "admin@example.com",
      "password": "adminpassword"
    }
  }
}
*/
router.post('/applicationAdmin', async (req, res, next) => {
  try {
    const admin = await prisma.applicationAdmin.create({
      data: req.body,
    })

    res.status(200).json(admin);
  } catch (error) {
    next(error)
  }
});

/*
Create Admin Account

{
  "firstName": "Jordan",
  "lastName": "Doe",
  "phoneNumber": "12345678",
  "dateOfBirth": "1990-01-15T00:00:00Z", // need to be in iso format
  "user": {
    "create": {
      "email": "petowner@example.com",
      "password": "password"
    }
  }
}

*/
router.post('/petOwners', async (req, res, next) => {
  try {
    const petowners = await prisma.petOwner.create({
      data: req.body,
    })

    res.status(200).json(petowners);
  } catch (error) {
    next(error)
  }
});

/*
Create pet Business Account

{
  "companyName": "abc company",
  "uen": "12345wqatg",
  "businessType": "SERVICE",
  "businessDescription": "abc company is a company that provides grooming services",
  "contactNumber": "12345678",
  "user": {
    "create": {
      "email": "petBusiness@example.com",
      "password": "password"
    }
  }
}

*/
router.post('/petBusiness', async (req, res, next) => {
  try {
    const petBusiness = await prisma.petBusiness.create({
      data: req.body,
    })

    res.status(200).json(petBusiness);
  } catch (error) {
    next(error)
  }
});

module.exports = router;
