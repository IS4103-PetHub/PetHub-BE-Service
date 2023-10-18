
const prisma = require('../../../../prisma/prisma');
const petBusinessService = require('../../services/user/petBusinessService')
const petOwnerService = require('../../services/user/petOwnerService')
const CustomError = require('../../errors/customError')
const OrderItemsError = require('../../errors/orderItemError')
const { OrderItemStatus } = require('@prisma/client')
const emailService = require('../../services/emailService')
const emailTemplate = require('../../resource/emailTemplate');


class OrderItemService {
  constructor() {}

  async getOrderItemById(orderItemId) {
    try {
      const orderItem = await prisma.orderItem.findUnique({
        where: { orderItemId: orderItemId },
        include: {
          booking: true,
          serviceListing: {
            include: {
              tags: true,
              addresses: true,
              petBusiness: {
                select: {
                  companyName: true,
                },
              },
            },
          },
          invoice: {
            select: {
              paymentId: true,
              createdAt: true,
            },
          },
        },
      });

      if (!orderItem) throw new CustomError("Order item not found", 404);
      return orderItem;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new OrderItemsError(error);
    }
  }

  async getAllOrderItems(statusFilterArray = undefined) {
    try {
      let orderItems = await prisma.orderItem.findMany({
        include: {
          booking: true,
          serviceListing: {
            include: {
              tags: true,
              addresses: true,
              petBusiness: {
                select: {
                  companyName: true,
                },
              },
            },
          },
          invoice: {
            select: {
              paymentId: true,
              createdAt: true,
            },
          },
        },
      });

      if (statusFilterArray) orderItems = this.filterOrderItems(orderItems, statusFilterArray);
      return orderItems;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new OrderItemsError(error);
    }
  }

  async getPetOwnerOrderItemsById(petOwnerId, statusFilterArray = undefined) {
    try {
      const petOwner = await petOwnerService.getUserById(petOwnerId);

      const invoices = await prisma.invoice.findMany({
        where: { petOwnerUserId: petOwner.userId },
        include: {
          orderItems: {
            include: {
              booking: true,
              serviceListing: {
                include: {
                  tags: true,
                  addresses: true,
                  petBusiness: {
                    select: {
                      companyName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      let orderItems = invoices.flatMap((invoice) => {
        return invoice.orderItems.map((orderItem) => ({
          ...orderItem,
          invoice: {
            paymentId: invoice.paymentId, // attach paymentId from invoice too
            createdAt: invoice.createdAt, // attach createdAt from invoice too
          },
        }));
      });

      if (statusFilterArray) orderItems = this.filterOrderItems(orderItems, statusFilterArray);

      return orderItems;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new OrderItemsError(error);
    }
  }

  async getPetBusinessOrderItemsById(petBusinessId, statusFilterArray = undefined) {
    try {
      const petBusiness = await petBusinessService.getUserById(petBusinessId);

      const serviceListings = await prisma.serviceListing.findMany({
        where: { petBusinessId: petBusiness.userId },
        include: {
          tags: true,
          addresses: true,
          OrderItem: {
            include: {
              booking: true,
              invoice: {
                select: {
                  paymentId: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      let orderItems = serviceListings.flatMap((serviceListing) =>
        serviceListing.OrderItem.map((orderItem) => {
          return {
            ...orderItem,
            serviceListing: {
              ...serviceListing,
              OrderItem: undefined, // manually disconnect OrderItem from serviceListing
            },
          };
        })
      );

      if (statusFilterArray) orderItems = this.filterOrderItems(orderItems, statusFilterArray);

      return orderItems;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new OrderItemsError(error);
    }
  }

    async completeOrderItem(orderItemId, userId, voucherCode) {
        try {
          const orderItem = await prisma.orderItem.findUnique({
            where: { orderItemId: orderItemId },
            include: {
              serviceListing: {
                include: {
                  petBusiness: {
                    select: {
                      companyName: true,
                      businessEmail: true,
                    },
                  },
                },
              },
              invoice: {
                include: {
                  PetOwner: {
                    include: {
                      user: {
                        select: {
                          userId: true,
                          email: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
          if (!orderItem) throw new CustomError("Order item not found", 404);

          // Verify that user is the one who purchased this orderItem
          if (orderItem.invoice.PetOwner.user.userId != userId) {
            throw new CustomError("User error - UserId does not match user who purchased this Order Item", 400);
          }

          // Verify that the orderItem has not been fulfilled yet
          if (orderItem.status === "FULFILLED") {
            throw new CustomError("Order Item has already been fulfilled", 400);
          }

          // Verify that voucher code is correct
          if (orderItem.voucherCode !== voucherCode) {
            throw new CustomError("Invalid voucher code", 400);
          }

          // The voucher code matches; update the status to "FULFILLED" and update dateFulfilled to today's date
          const updatedOrderItem = await prisma.orderItem.update({
            where: { orderItemId: orderItemId },
            data: {
              status: "FULFILLED",
              dateFulfilled: new Date(),
            },
          });

          // Send email to PO and PB that order has been fulfilled
          // For PB, email is sent to the PB's businessEmail
          await emailService.sendEmail(
            orderItem.invoice.PetOwner.user.email,
            `${orderItem.invoice.PetOwner.firstName}, Your PetHub Order Has Been Fulfilled!`,
            emailTemplate.POVoucherFulfillmentEmail(orderItem));

          await emailService.sendEmail(
            orderItem.serviceListing.petBusiness.businessEmail,
            `${orderItem.serviceListing.petBusiness.companyName}, A PetHub Order Has Been Fulfilled!`,
            emailTemplate.PBVoucherFulfillmentEmail(orderItem));

          return updatedOrderItem;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new OrderItemsError(error)
        }
    }

  filterOrderItems(orderItems, statusFilterArray = Object.values(OrderItemStatus)) {
    const statusFilter = new Set(statusFilterArray);
    return orderItems.filter((orderItem) => statusFilter.has(orderItem.status));
  }
}

module.exports = new OrderItemService();
