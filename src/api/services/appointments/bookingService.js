const CustomError = require("../../errors/customError");
const BookingError = require("../../errors/bookingError");
const CalendarGroupService = require('./calendarGroupService')
const prisma = require('../../../../prisma/prisma');
const PetOwnerService = require('../user/petOwnerService')
const OrderItemService = require('../finance/orderItemService')
const { OrderItemStatus } = require('@prisma/client')

class BookingService {
    async createBooking(petOwnerId, calendarGroupId, orderItemId, startTime, endTime, petId) {
        try {
            const petOwner = await PetOwnerService.getUserById(petOwnerId) // Validate if it's pet owner
            const orderItem = await OrderItemService.getOrderItemById(orderItemId) // validate if orderItem is valid

            if (orderItem.status !== OrderItemStatus.PENDING_BOOKING) {
                if (orderItem.bookingId) {
                    throw new CustomError("Unable to create new booking: booking has already been created for order item", 400)
                } else {
                    throw new CustomError("Unable to create new booking: order item is not pending booking", 400)
                }
            }

            if (orderItem.expiryDate <= startTime) {
                throw new CustomError("The order item expires before selected start time.", 400);
            }

            const bookingDuration = Math.abs((new Date(endTime) - new Date(startTime)) / 60000);
            const availableSlots = await CalendarGroupService.getAvailability(Number(orderItem.orderItemId), new Date(startTime), new Date(endTime), bookingDuration);
            if (availableSlots.length === 0) throw new CustomError("Unable to create new booking, no available timeslots", 406);

            // Always choose the first available slot for simplicity.
            availableSlots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            const chosenSlot = availableSlots[0];
            const createdBooking = await prisma.$transaction(async (prismaClient) => {
                const newBooking = await prismaClient.booking.create({
                    data: {
                        petOwnerId: petOwnerId,
                        startTime: startTime,
                        endTime: endTime,
                        serviceListingId: orderItem.serviceListingId,
                        timeSlotId: chosenSlot.timeSlotId,
                        petId: petId,
                        orderItemId: orderItem.orderItemId,
                    }
                });

                await prismaClient.orderItem.update({
                    where: { orderItemId: orderItem.orderItemId },
                    data: { status: OrderItemStatus.PENDING_FULFILLMENT },
                })

                return newBooking;
            })

            return createdBooking;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new BookingError(error);
        }
    }

    async getBookingById(bookingId) {
        try {
            const booking = await prisma.booking.findUnique({
                where: { bookingId: bookingId },
                include: {
                    timeSlot: true,
                    pet: true,
                    serviceListing: true,
                    OrderItem: true,
                }
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
                include: {
                    timeSlot: true,
                    pet: true
                }
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
                },
                include: {
                    pet: true
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
                },
                include: {
                    serviceListing: {
                        include: {
                            petBusiness: {
                                select: {
                                    companyName: true
                                }
                            },
                            addresses: true
                        }
                    },
                    OrderItem: {
                        select: {
                            voucherCode: true
                        }
                    },
                    pet: true
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
                    timeSlot: true,
                    pet: true
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

            if (existingBooking.OrderItem.status !== OrderItemStatus.PENDING_FULFILLMENT) {
                throw new CustomError("Unable to create new booking: order item is either expired or has already been fulfilled", 400)
            }
            if (existingBooking.OrderItem.expiryDate <= newStartTime) {
                throw new CustomError("The order item expires before selected start time.", 400);
            }

            const orderItemId = existingBooking.OrderItem.orderItemId;

            const bookingDuration = Math.abs((new Date(newStartTime) - new Date(newEndTime)) / 60000);
            const availableSlots = await CalendarGroupService.getAvailability(Number(orderItemId), new Date(newStartTime), new Date(newEndTime), bookingDuration);
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
