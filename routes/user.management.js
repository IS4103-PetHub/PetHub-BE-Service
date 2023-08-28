const router = require('express').Router();
const { PrismaClient } = require('@prisma/client')

// TO DO: ensure only single instance of prisma is created application start up
const prisma = new PrismaClient()

const bcrypt = require('bcrypt');

router.use('/users', router);

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
router.get('/application-admin/', async (req, res, next) => {
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
router.get('/pet-owners', async (req, res, next) => {
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
router.get('/pet-businesses', async (req, res, next) => {
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

NOTE: Not sure if should be doing the create this way using "create:{}"
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
router.post('/application-admins', async (req, res, next) => {
  try {
    const adminPayload = req.body;
    if (!isValidPassword(adminPayload.user.create.password)) {
      return res.status(400).json({ message: 'Invalid password format' });
    }
    adminPayload.user.create.password = await hashPassword(adminPayload.user.create.password);
    if (!isValidEmail(adminPayload.user.create.email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const admin = await prisma.applicationAdmin.create({
      data: adminPayload,
      include: {
        user: true,
      }
    })

    res.sendStatus(200);
  } catch (error) {
    next(error)
  }
});

/*
Create Pet Owner Account

{
  "firstName": "Jordan",
  "lastName": "Doe",
  "contactNumber": "12345678",
  "dateOfBirth": "1990-01-15T00:00:00Z", // need to be in iso format
  "user": {
    "create": {
      "email": "petowner@example.com",
      "password": "password"
    }
  }
}

*/
router.post('/pet-owners', async (req, res, next) => {
  try {
    const petOwnersPayload = req.body;
    if (!isValidPassword(petOwnersPayload.user.create.password)) {
      return res.status(400).json({ message: 'Invalid password format' });
    }
    petOwnersPayload.user.create.password = await hashPassword(petOwnersPayload.user.create.password);
    if (!isValidEmail(petOwnersPayload.user.create.email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    if (!isValidNumber(petOwnersPayload.contactNumber)) {
      return res.status(400).json({ message: 'Invalid Contact Number format' });
    }
    if (!isValidDate(petOwnersPayload.dateOfBirth)) {
      return res.status(400).json({ message: 'Invalid Date' });
    }

    const petowners = await prisma.petOwner.create({
      data: petOwnersPayload,
      include: {
        user: true,
      }
    })

    res.sendStatus(200);
  } catch (error) {
    next(error)
  }
});

/*
Create pet Business Account

{
  "companyName": "abc company",
  "contactNumber": "12345678",
  "user": {
    "create": {
      "email": "petBusiness@example.com",
      "password": "password"
    }
  }
}

*/
router.post('/pet-businesses', async (req, res, next) => {
  try {
    const petBusinessPayload = req.body;
    if (!isValidPassword(petBusinessPayload.user.create.password)) {
      return res.status(400).json({ message: 'Invalid password format' });
    }
    petBusinessPayload.user.create.password = await hashPassword(petBusinessPayload.user.create.password);
    if (!isValidEmail(petBusinessPayload.user.create.email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    if (!isValidNumber(petBusinessPayload.contactNumber)) {
      return res.status(400).json({ message: 'Invalid Contact Number format' });
    }


    const petBusiness = await prisma.petBusiness.create({
      data: petBusinessPayload,
      include: {
        user: true,
      }
    })

    res.sendStatus(200);
  } catch (error) {
    next(error)
  }
});

module.exports = router;

// Helper Functions
async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}


// Validation Functions
function isValidNumber(number) {
  return /^\d{8}$/.test(number);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(date) {
  const parsedDate = new Date(date);
  if (!isNaN(parsedDate.getTime()) && parsedDate <= new Date()) {
    return true;
  }
  return false;
}

function isValidPassword(password) {
  const passwordRegex = /^(?!.* )(?=.*\d)(?=.*[a-z]).{8,}$/;
  return passwordRegex.test(password)
}