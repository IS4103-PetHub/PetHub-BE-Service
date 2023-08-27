const router = require('express').Router();
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const bcrypt = require('bcrypt');

/*
    login payload
    {
        "email": "user",
        "password": "password"
    }

    Returns the appropriate user information. e.g, if user is admin, return admin information.
*/
router.post('/login', async (req, res, next) => {
    try {
        console.log("TEST")
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
            include: {
                applicationAdmin: true,
                petOwner: true,
                petBusiness: true,
            },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.applicationAdmin) {
            return res.status(200).json(user.applicationAdmin);
        } else if (user.petOwner) {
            return res.status(200).json(user.petOwner);
        } else if (user.petBusiness) {
            return res.status(200).json(user.petBusiness);
        } else {
            return res.status(401).json({ message: 'Invalid user type' });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;