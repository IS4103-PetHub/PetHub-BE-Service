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

      const filters = {
        statusFilterArray: statusFilterArray,
        serviceListingFilterArray: undefined,
        startDate: undefined,
        endDate: undefined
      }

      if (statusFilterArray) orderItems = this.filterOrderItems(orderItems, filters);
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

      const filters = {
        statusFilterArray: statusFilterArray,
        serviceListingFilterArray: undefined,
        startDate: undefined,
        endDate: undefined
      }

      if (statusFilterArray) orderItems = this.filterOrderItems(orderItems, filters);

      return orderItems;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new OrderItemsError(error);
    }
  }

  async getPetBusinessOrderItemsById(
    petBusinessId,
    statusFilterArray = undefined,
    startDate = undefined,
    endDate = undefined,
    serviceListingFilterArray = undefined
  ) {
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

      const filters = {
        statusFilterArray: statusFilterArray,
        serviceListingFilterArray: serviceListingFilterArray,
        startDate: startDate,
        endDate: endDate
      }

      const filteredOrderItems = this.filterOrderItems(orderItems, filters)


      filteredOrderItems.sort((a, b) => {
        const dateA = new Date(a.invoice.createdAt);
        const dateB = new Date(b.invoice.createdAt);
        return dateA - dateB;
      });

      return filteredOrderItems;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new OrderItemsError(error);
    }
  }

  filterOrderItems(orderItems, filters) {
    const {
      statusFilterArray,
      serviceListingFilterArray,
      startDate,
      endDate,
    } = filters;
  
    const statusFilter = new Set(statusFilterArray);
    const serviceListingFilter = new Set(serviceListingFilterArray);
  
    return orderItems.filter((orderItem) => {
      const createdAt = new Date(orderItem.invoice.createdAt);
      
      // Apply status filter if provided
      if (statusFilterArray && !statusFilter.has(orderItem.status)) {
        return false;
      }
      
      // Apply service listing filter if provided
      if (serviceListingFilterArray && !serviceListingFilter.has(orderItem.serviceListingId.toString())) {
        return false;
      }
      
      // Apply date range filter if provided
      if (startDate && endDate && (createdAt < new Date(startDate) || createdAt > new Date(endDate))) {
        return false;
      }
      
      // If all filters pass, keep the order item
      return true;
    });
  }
}

module.exports = new OrderItemService();
