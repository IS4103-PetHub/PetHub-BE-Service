const prisma = require("../../../../prisma/prisma");
const CustomError = require("../../errors/customError");
const { format } = require('date-fns');

exports.getRevenueTrackingData = async () => {
  try {
    const summary = await this.getRevenueDataSummary();
    const top5 = await this.getTopNPetBusinessesWithinDateRange(5);
    const top5Within30Days = await this.getTopNPetBusinessesWithinDateRange(5, 30);
    const monthlyData = await this.getMonthlyData();
    const dataByTypes = await this.getDataByTypes();

    const revenueTrackingData = {
      summary: {
        totalTransactionAmount: summary.totalTransactionAmount,
        totalCommissionEarned: summary.totalCommissionEarned,
        last30DaysTransactionAmount: summary.last30DaysTransactionAmount,
        last30DaysCommissionEarned: summary.last30DaysCommissionEarned,
      },
      lists: {
        byOrderCount: {
          allTimeTop5PetBusinessByOrders: top5.byOrderCount,
          top5PetBusinessWithin30DaysByOrders: top5Within30Days.byOrderCount,
        },
        bySaleAmount: {
          allTimeTop5PetBusinessBySales: top5.bySales,
          top5PetBusinessWithin30DaysBySales: top5Within30Days.bySales,
        },
      },
      charts: {
        areaChart: {
          monthlyData: monthlyData,
        },
        pieChart: {
          commissionByCategory: dataByTypes.commissionByCategory,
          commissionByBusinessTypes: dataByTypes.commissionByBusinessType,
        }
      },
    };

    return revenueTrackingData;
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    throw new CustomError("Error fetching revenue data");
  }
};

exports.getRevenueDataSummary = async () => {
  try {
    // Calculate the date 30 days ago from the current date
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set the time to midnight
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    const totalTransactionAmount = await prisma.payoutInvoice.aggregate({
      _sum: {
        totalAmount: true,
        commissionCharge: true,
      },
    });

    const last30DaysTransactionAmount = await prisma.payoutInvoice.aggregate({
      _sum: {
        totalAmount: true,
        commissionCharge: true,
      },
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });
    return {
      totalTransactionAmount: totalTransactionAmount._sum.totalAmount || 0,
      totalCommissionEarned: totalTransactionAmount._sum.commissionCharge || 0,
      last30DaysTransactionAmount: last30DaysTransactionAmount._sum.totalAmount || 0,
      last30DaysCommissionEarned: last30DaysTransactionAmount._sum.commissionCharge || 0,
    };
  } catch (error) {
    console.error("Error fetching revenue data summary:", error);
    throw new CustomError("Error fetching revenue data summary");
  }
};

exports.getTopNPetBusinessesWithinDateRange = async (n, dateRange = null) => {
  try {
    const payoutInvoices = await this.extractPayoutInvoiceData(dateRange);
    const aggregatedPetBusinessDataMap = await this.aggregatePetBusinessData(payoutInvoices);

    const topNByOrderCount = this.sortPetBusinessByOrderCount(aggregatedPetBusinessDataMap, n);
    const topNBySales = this.sortPetBusinessBySalesAmount(aggregatedPetBusinessDataMap, n);

    return {
      byOrderCount: topNByOrderCount,
      bySales: topNBySales
    }

  } catch (error) {
    console.error("Error fetching top N pet businesses within date range:", error);
    throw new CustomError("Error fetching top N pet businesses within date range");
  }
};

exports.extractPayoutInvoiceData = async (dateRange = null) => {
  try {
    let whereClause = {
      petBusiness: {
        NOT: {
          businessType: null, // Ensure that the PB's application is approved
        },
      },
    };

    // Update whre clause if date range was passed in, as an additional filter
    if (dateRange) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      whereClause = {
        ...whereClause,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      };
    }

    const payoutInvoices = await prisma.payoutInvoice.findMany({
      where: whereClause,
      include: {
        orderItems: {
          select: {
            orderItemId: true,
          },
        },
        petBusiness: {
          select: {
            companyName: true,
            businessType: true,
            businessEmail: true,
            user: {
              select: {
                email: true,
                dateCreated: true,
              },
            },
          },
        },
      },
    });

    return payoutInvoices;
  } catch (error) {
    console.error("Error extracting payout invoice for data aggregation:", error);
    throw new CustomError("Error extracting payout invoice for data aggregation");
  }
};

exports.aggregatePetBusinessData = (payoutInvoices) => {
  let petBusinessMap = new Map();

  payoutInvoices.forEach((payoutInvoice) => {
    const { userId, totalAmount, commissionCharge, orderItems, petBusiness } = payoutInvoice;

    if (!petBusinessMap.has(userId)) {
      petBusinessMap.set(userId, {
        petBusinessId: userId,
        totalAmount: 0,
        totalCommission: 0,
        orderItemCount: 0,
        companyName: petBusiness.companyName,
        businessType: petBusiness.businessType,
        userEmail: petBusiness.user.email,
        dateJoined: format(petBusiness.user.dateCreated, "dd-MM-yyyy")
      });
    }

    const businessData = petBusinessMap.get(userId);
    businessData.totalAmount += totalAmount;
    businessData.totalCommission += commissionCharge;
    businessData.orderItemCount += orderItems.length;
  });

  // Iterate through the map entries and round the numbers to 2 decimal places
  for (const [userId, businessData] of petBusinessMap.entries()) {
    businessData.totalAmount = parseFloat(businessData.totalAmount.toFixed(2));
    businessData.totalCommission = parseFloat(businessData.totalCommission.toFixed(2));
  }

  return petBusinessMap;
};

exports.sortPetBusinessByOrderCount = (petBusinessMap, n) => {
  const sortedByOrderCount = [...petBusinessMap.values()].sort((a, b) => b.orderItemCount - a.orderItemCount);
  return sortedByOrderCount.slice(0, n);
};

exports.sortPetBusinessBySalesAmount = (petBusinessMap, n) => {
  const sortedBySalesAmount = [...petBusinessMap.values()].sort((a, b) => b.totalAmount - a.totalAmount);
  return sortedBySalesAmount.slice(0, n);
};

exports.getMonthlyData = async () => {
  try {
    const currentDate = new Date();
    currentDate.setDate(1);
    const monthlyData = [];

    for (let i = 0; i < 12; i++) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      let monthName = new Date(year, month - 1, 1).toLocaleString("default", {
        month: "short",
      });
      if (monthName === "Sept") {
        monthName = "Sep";
      }

      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month - 1, 31, 23, 59, 59, 999);

      let transactions = 0;
      let commissionEarned = 0;

      const payoutInvoices = await prisma.payoutInvoice.findMany({
        where: {
          createdAt: {
            gte: firstDay,
            lte: lastDay,
          },
        },
        include: {
          orderItems: true,
        },
      });

      // Calculate this month's transaction and commission data
      for (const invoice of payoutInvoices) {
        for (const orderItem of invoice.orderItems) {
          const commissionAmount = orderItem.itemPrice * orderItem.commissionRate;
          transactions += orderItem.itemPrice;
          commissionEarned += commissionAmount;
        }
      }

      monthlyData.push([`${monthName} ${year}`, transactions, parseFloat(commissionEarned.toFixed(2))]);

      // Adjust the date to the previous month
      currentDate.setMonth(currentDate.getMonth() - 1);
    }

    // Get it in ascending order
    monthlyData.reverse();
    monthlyData.unshift(["Month", "Transactions", "Commission Earned"]);

    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly data:", error);
    throw new CustomError("Error fetching monthly data");
  }
};

exports.getDataByTypes = async () => {
  try {
    const payoutInvoices = await prisma.payoutInvoice.findMany({
      where: {
        petBusiness: {
          NOT: {
            businessType: null, // Ensure that the PB's application is approved
          },
        },
      },
      include: {
        orderItems: true,
        petBusiness: {
          select: {
            companyName: true,
            businessType: true,
            businessEmail: true,
          },
        },
      },
    });

    let categoryToCommission = new Map(); // category : total commission
    let businessTypeToCommission = new Map(); // businessType : total commission

    for (const invoice of payoutInvoices) {
      for (const orderItem of invoice.orderItems) {
        const serviceListing = await prisma.serviceListing.findUnique({
          where: {
            serviceListingId: orderItem.serviceListingId,
          },
        });
        const categoryName = serviceListing.category;
        const businessType = invoice.petBusiness.businessType;
        const commissionAmount = orderItem.itemPrice * orderItem.commissionRate;

        if (categoryToCommission.has(categoryName)) {
          categoryToCommission.set(
            categoryName,
            categoryToCommission.get(categoryName) + commissionAmount
          );
        } else {
          categoryToCommission.set(categoryName, commissionAmount);
        }

        if (businessTypeToCommission.has(businessType)) {
          businessTypeToCommission.set(
            businessType,
            businessTypeToCommission.get(businessType) + commissionAmount
          );
        } else {
          businessTypeToCommission.set(businessType, commissionAmount);
        }

      }
    }
    
    const commissionByCategory = [["Category", "Commission"]];
    for (const [category, commission] of categoryToCommission) {
      commissionByCategory.push([category, parseFloat(commission.toFixed(2))]);
    }
  
    const commissionByBusinessType = [["Business Type", "Commission"]];
    for (const [businessType, commission] of businessTypeToCommission) {
      commissionByBusinessType.push([businessType, parseFloat(commission.toFixed(2))]);
    }
    
    return { commissionByCategory, commissionByBusinessType };

  } catch (error) {
    console.error("Error fetching data by category and business type:", error);
    throw new CustomError("Error fetching data by category and business type");
  }
};
