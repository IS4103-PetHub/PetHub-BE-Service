const prisma = require("../../../../prisma/prisma");


exports.getPetBusinessData = async (petBusinessId) => {
  try {
    const summary = await this.getPetBusinessSummary(petBusinessId);
    const allTimeTop5ServiceListings = await this.getAllTimeTopNServiceListings(
      petBusinessId,
      5 
    );
    const top5ServiceListingsWithin30Days =
      await this.getTopNServiceListingsWithin30Days(petBusinessId, 5);
    const monthlySales = await this.getMonthlySales(petBusinessId);

    const petBusinessData = {
      summary,
      lists: {
        allTimeTop5ServiceListings: allTimeTop5ServiceListings,
        top5ServiceListingsWithin30Days: top5ServiceListingsWithin30Days,
      },
      charts: {
        monthlySales: monthlySales,
      },
    };

    return petBusinessData;
  } catch (error) {
    console.error("Error fetching Pet Business data:", error);
    throw new Error("Error fetching Pet Business data");
  }
};

// Given a PB ID, this function will get total number of orders, total sale $, 
// last 30 day sale $ and the date with most sales + sale $ on that day
exports.getPetBusinessSummary = async (petBusinessId) => {
  try {
    // Total num Orders
    const totalNumOrders = await prisma.orderItem.count({
      where: {
        serviceListing: {
          petBusinessId: petBusinessId,
        },
      },
    });

    // Total Sales $
    const totalSales = await prisma.orderItem.aggregate({
      _sum: {
        itemPrice: true,
      },
      where: {
        serviceListing: {
          petBusinessId: petBusinessId,
        },
      },
    });

    // Last 30 Day Sales $
    const currentDate = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaySales = await prisma.orderItem.aggregate({
      _sum: {
        itemPrice: true,
      },
      where: {
        serviceListing: {
          petBusinessId: petBusinessId,
        },
        invoice: {
          createdAt: {
            gte: thirtyDaysAgo,
            lte: currentDate,
          },
        },
      },
    });

    // Date with most sales and sale total $ on that day
    const mostSales = await prisma.invoice.findFirst({
      where: {
        orderItems: {
          some: {
            serviceListing: {
              petBusinessId: petBusinessId,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
    });

    const mostSalesDate = mostSales.createdAt;
    const mostSalesAmount = mostSales.totalPrice;

    const summary = {
      totalNumOrders,
      totalSales: totalSales._sum.itemPrice,
      last30DaySales: last30DaySales._sum.itemPrice,
      mostSalesDate: mostSalesDate,
      mostSalesAmount: mostSalesAmount,
    };

    return summary;
  } catch (error) {
    console.error("Error fetching Pet Business summary:", error);
    throw new Error("Error fetching Pet Business summary");
  }
};

// This function should get the top n service listings (of a petBusiness) of all time based on the number of times it was ordered.
// For simplicity, it will include ALL sales, EG no filtering of the orderItem status is done
exports.getAllTimeTopNServiceListings = async (petBusinessId, n) => {
  try {
    // Get All-Time Top N Service Listings and Sales
    const allTimeTopNServiceListings = await prisma.serviceListing.findMany({
      where: {
        petBusinessId: petBusinessId,
      },
      include: {
        OrderItem: true,
      },
    });
    // Sort in descending order by number of orders per service listing
    allTimeTopNServiceListings.sort(
      (a, b) => b.OrderItem.length - a.OrderItem.length
    );

    // Select the top n service listings
    const topN = allTimeTopNServiceListings.slice(0, n);

    // Calculate sales for the top n service listings
    const allTimeTopN = topN.map((service) => ({
      serviceListingId: service.serviceListingId,
      title: service.title,
      category: service.category,
      totalOrders: service.OrderItem.length,
      totalSales: service.basePrice * service.OrderItem.length,
    }));

    return allTimeTopN;
  } catch (error) {
    throw error;
  }
};

// This function should get the top n service listings (of a petBusiness) within 30 days based on the number of times it was ordered.
// For simplicity, it will include ALL sales, EG no filtering of the orderItem status is done
exports.getTopNServiceListingsWithin30Days = async (petBusinessId, n) => {

  // Retrieve invoices for the specified pet business within the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const invoices = await prisma.invoice.findMany({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
      orderItems: {
        some: {
          serviceListing: {
            petBusinessId: petBusinessId,
          },
        },
      },
    },
    include: {
      orderItems: {
        include: {
          serviceListing: true,
        },
      },
    },
  });

  // Create a map to track the number of orders and sales for each service listing
  const serviceListingsMap = new Map();

  // Iterate through invoices and order items, for the order items, if the service listing is created by
  // the petbusinessId passed in, keep track of how many times it was bought and the total $ earned from this listing
  for (const invoice of invoices) {
    for (const orderItem of invoice.orderItems) {
      if (orderItem.serviceListing.petBusinessId === petBusinessId) {
        const serviceListingId = orderItem.serviceListingId;
        if (serviceListingsMap.has(serviceListingId)) {
          serviceListingsMap.get(serviceListingId).totalOrders++;
          serviceListingsMap.get(serviceListingId).totalSales +=
            orderItem.itemPrice;
        } else {
          serviceListingsMap.set(serviceListingId, {
            serviceListingId: serviceListingId,
            title: orderItem.serviceListing.title,
            category: orderItem.serviceListing.category,
            totalOrders: 1,
            totalSales: orderItem.itemPrice,
          });
        }
      }
    }
  }

  // Convert to array and sort by totalOrders in descending order
  const serviceListingsArray = Array.from(serviceListingsMap.values());
  serviceListingsArray.sort((a, b) => b.totalOrders - a.totalOrders);

  // Select the top n service listings
  const topN = serviceListingsArray.slice(0, n);
  console.log(topN);

  // Calculate sales for the top n service listings
  const topNSalesWithin30Days = topN.map((service) => ({
    serviceListingId: service.serviceListingId,
    title: service.title,
    category: service.category,
    totalOrders: service.totalOrders,
    totalSales: service.totalSales,
  }));

  return topNSalesWithin30Days;
};

// This function will get the Monthly Sales $ (data is retrieved for each month, for past 12 months)
// For simplicity, it will include ALL sales, EG no filtering of the orderItem status is done
exports.getMonthlySales = async (petBusinessId) => {
  const currentDate = new Date();
  currentDate.setDate(1);
  const monthlySales = [];

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

    // For each time period, get the invoices and sales by the PB and aggregate them
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      include: {
        orderItems: {
          // where: {
          //   status: "FULFILLED",
          // },
          include: {
            serviceListing: true,
          },
        },
      },
    });

    let totalSales = 0;
    for (const invoice of invoices) {
      for (const orderItem of invoice.orderItems) {
        if (orderItem.serviceListing.petBusinessId === petBusinessId) {
          totalSales += orderItem.itemPrice;
        }
      }
    }

    monthlySales.push([`${monthName} ${year}`, totalSales]);

    // Adjust the date to the previous month
    currentDate.setMonth(currentDate.getMonth() - 1);
  }

  monthlySales.reverse();
  monthlySales.unshift(["Month", "Sales"]);

  return monthlySales;
};
