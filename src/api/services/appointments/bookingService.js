const CustomError = require("../../errors/customError");
const BookingError = require("../../errors/bookingError");
const CalendarGroupService = require('./calendarGroupService')
const prisma = require('../../../../prisma/prisma');
const PetOwnerService = require('../user/petOwnerService')
class BookingService {

    async createBooking(petOwnerId, calendarGroupId, serviceListingId, startTime, endTime) {
        try {
            const petOwner = await PetOwnerService.getUserById(petOwnerId) // Validate if it's pet owner
            const bookingDuration = Math.abs((new Date(endTime) - new Date(startTime)) / 60000);
            const availableSlots = await CalendarGroupService.getAvailability(Number(calendarGroupId), new Date(startTime), new Date(endTime), bookingDuration);
            if (availableSlots.length === 0) throw new CustomError("Unable to create new booking, no available timeslots", 406);

            // Always choose the first available slot for simplicity.
            availableSlots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            const chosenSlot = availableSlots[0];

            const newBooking = await prisma.booking.create({
                data: {
                    petOwnerId: petOwnerId,
                    startTime: startTime,
                    endTime: endTime,
                    serviceListingId: serviceListingId,
                    timeSlotId: chosenSlot.timeSlotId
                }
            });

            return newBooking;

        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new BookingError(error);
        }
    }

    async getBookingById(bookingId) {
        try {
            const booking = await prisma.booking.findUnique({
                where: { bookingId: bookingId },
                include: { timeSlot: true }
            });

            if (!booking) throw new CustomError(`Booking with id (${bookingId}) not found`, 404);

            return booking;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new BookingError(error);
        }
    }

    async getBookings(startTime, endTime) {
        try {
            const bookings = await prisma.booking.findMany({
                where: {
                    AND: [
                        { startTime: { gte: startTime } },
                        { endTime: { lte: endTime } }
                    ]
                },
            });

            return bookings;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new BookingError(error);
        }
    }

    async getBookingsByCalendarGroup(calendarGroupId, startTime, endTime) {
        try {
            const bookings = await prisma.booking.findMany({
                where: {
                    AND: [
                        { timeSlot: { calendarGroupId: calendarGroupId } },
                        { startTime: { gte: startTime } },
                        { endTime: { lte: endTime } }
                    ]
                },
                include: { timeSlot: true }
            });

            return bookings;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new BookingError(error);
        }
    }

    async getBookingsByServiceListing(serviceListingId, startTime, endTime) {
        try {
            const bookings = await prisma.booking.findMany({
                where: {
                    AND: [
                        { serviceListingId: serviceListingId },
                        { startTime: { gte: startTime } },
                        { endTime: { lte: endTime } }
                    ]
                }
            });

            return bookings;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new BookingError(error);
        }
    }

    async getBookingsByUser(userId, startTime, endTime) {
        try {
            const bookings = await prisma.booking.findMany({
                where: {
                    AND: [
                        { petOwnerId: userId },
                        { startTime: { gte: startTime } },
                        { endTime: { lte: endTime } }
                    ]
                }
            });

            return bookings;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new BookingError(error);
        }
    }

    async getBookingByPetBusiness(petBusinessId, startTime, endTime) {
        try {
            const bookings = await prisma.booking.findMany({
                where: {
                    AND: [
                        {
                            serviceListing: {
                                petBusinessId: petBusinessId
                            }
                        },
                        { startTime: { gte: startTime } },
                        { endTime: { lte: endTime } }
                    ]
                },
                include: {
                    serviceListing: {
                        include: {
                            tags: true,
                            addresses: true
                        }
                    },
                    timeSlot: true
                }
            });
            
            for (let i = 0; i < bookings.length; i++) {
                const booking = bookings[i];
                const petOwner = await prisma.petOwner.findUnique({
                    where: { userId: booking.petOwnerId },
                    include: { user: true }
                });
                const flattenedPetOwner = {
                    firstName: petOwner.firstName,
                    lastName: petOwner.lastName,
                    contactNumber: petOwner.contactNumber,
                    dateOfBirth: petOwner.dateOfBirth,
                    email: petOwner.user.email,

                }
                bookings[i].petOwner = flattenedPetOwner;
            }
            return bookings;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new BookingError(error);
        }
    }

    async updateBooking(bookingId, newStartTime, newEndTime) {
        try {
            const existingBooking = await this.getBookingById(bookingId)
            const calendarGroupId = existingBooking.timeSlot.calendarGroupId

            const bookingDuration = Math.abs((new Date(newStartTime) - new Date(newEndTime)) / 60000);
            const availableSlots = await CalendarGroupService.getAvailability(Number(calendarGroupId), new Date(newStartTime), new Date(newEndTime), bookingDuration);
            if (availableSlots.length === 0) throw new CustomError(`Unable to update booking (${bookingId}), no available timeslots`, 406);

            // Always choose the first available slot for simplicity.
            availableSlots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            const chosenSlot = availableSlots[0];

            const updatedBooking = await prisma.booking.update({
                where: { bookingId: bookingId },
                data: {
                    startTime: newStartTime,
                    endTime: newEndTime,
                    timeSlotId: chosenSlot.timeSlotId,
                    lastUpdated: new Date()
                }
            });

            return updatedBooking;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new BookingError(error);
        }
    }
}


module.exports = new BookingService();  // Exporting an instance of the service for usage
