const router = require('express').Router();
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const bcrypt = require('bcrypt');

/*
    login payload:
    {
        "email": "user",
        "password": "password"
    }

    returns:
    {
        name: "firstName",
        role: "admin",
        userId: 1
    }
*/
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const email = username
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
            const admin = {
                name: user.applicationAdmin.firstName,
                role: "applicationAdmin",
                userId: user.userId
            }
            return res.status(200).json(admin);
        } else if (user.petOwner) {
            const petOwner = {
                name: user.petOwner.firstName,
                role: "petOwner",
                userId: user.userId
            }
            return res.status(200).json(petOwner);
        } else if (user.petBusiness) {
            const petBusiness = {
                name: user.petBusiness.companyName,
                role: "petBusiness",
                userId: user.userId
            }
            return res.status(200).json(user.petBusiness);
        } else {
            return res.status(401).json({ message: 'Invalid user type' });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;