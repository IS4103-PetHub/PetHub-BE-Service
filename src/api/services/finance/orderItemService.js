const prisma = require("../../../../prisma/prisma");
const petBusinessService = require("../../services/user/petBusinessService");
const petOwnerService = require("../../services/user/petOwnerService");
const CustomError = require("../../errors/customError");
const OrderItemsError = require("../../errors/orderItemError");
const { OrderItemStatus } = require("@prisma/client");

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
          paymentId: invoice.paymentId, // attach paymentId from invoice too
          createdAt: invoice.createdAt, // attach createdAt from invoice too
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
        serviceListing.OrderItem.map((orderItem) => ({
          ...orderItem,
          serviceListing: {
            ...serviceListing,
            OrderItem: undefined, // manually disconnect OrderItem from serviceListing
          },
        }))
      );

      if (statusFilterArray) orderItems = this.filterOrderItems(orderItems, statusFilterArray);

      return orderItems;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new OrderItemsError(error);
    }
  }

  filterOrderItems(orderItems, statusFilterArray = Object.values(OrderItemStatus)) {
    const statusFilter = new Set(statusFilterArray);
    return orderItems.filter((orderItem) => statusFilter.has(orderItem.status));
  }
}

module.exports = new OrderItemService();
