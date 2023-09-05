const prisma = require('../../../prisma/prisma');
const CustomError = require('../errors/customError')

exports.getResetPasswordRecord = async (token) => {

    try {

        const record  = await prisma.resetPassword.findUnique({
            where: {token}
        })
        if(!record) throw new CustomError('Rest Password Record Not found', 404);
        return record
    } catch (error) {
        throw error
    }

}


exports.createResetPasswordRecrod = async (token, email) => {

    try {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + 15 * 60 * 1000);
    
        const record = await prisma.resetPassword.create({
            data: {
                token: token,
                email: email,
                expiryDate: expiryDate
            }
        })
    
        return record
    } catch (error) {
        throw error
    }
}

exports.deleteResetPasswordRecord = async (token) => {
    try {
        await prisma.resetPassword.delete({
            where: { token }
        })
    } catch (error) {
        throw error
    }
}