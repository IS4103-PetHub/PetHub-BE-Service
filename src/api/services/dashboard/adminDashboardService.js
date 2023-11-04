const { AccountType, Category } = require("@prisma/client");
const prisma = require("../../../../prisma/prisma");
const { subMonths, format } = require('date-fns');

exports.getAdminDashboardData = async () => {
    try {

        // overall insights
        const userCount = await this.getTotalUserCount();
        const serviceListing = await this.getServiceListingData();

        const adminDashboardData = {
            userDemographic: userCount,
            serviceListingData: serviceListing
        }

        return adminDashboardData
    } catch (error) {
        console.error("Error fetching Admin dashboard Data:", error);
        throw new Error("Error fetching admin dashboard data");
    }
}

exports.getTotalUserCount = async () => {
    try {
        // Get the count of newly created Pet Owners (PO)
        const oneMonthAgo = subMonths(new Date(), 1);
        const poCount = await prisma.user.count({
            where: {
                accountType: AccountType.PET_OWNER,
                accountStatus: 'ACTIVE',
                dateCreated: {
                    gte: oneMonthAgo,
                },
            },
        });

        // Get the count of newly activated Pet Businesses (PB)
        const pbCount = await prisma.user.count({
            where: {
                accountType: AccountType.PET_BUSINESS,
                accountStatus: 'ACTIVE',
                dateCreated: {
                    gte: oneMonthAgo,
                },
            },
        });

        // review count
        const reportedreviewCount = await prisma.review.count({
            where: {
                reportedBy: {
                    some: {},
                },
            },
        })


        // Get the count of pending Pet Business Applications (PB applications)
        const pbApplicationCount = await prisma.petBusinessApplication.count({
            where: {
                applicationStatus: 'PENDING',
            },
        });

        return {
            POCount: poCount,
            PBCount: pbCount,
            ReportedReviewCount: reportedreviewCount,
            PBApplicationCount: pbApplicationCount,
        }

    } catch (error) {
        console.error("Error generating Total User count:", error);
        throw new Error("Error generating Total User count");
    }
}

exports.getServiceListingData = async () => {
    try {

        // Get the count of Service Listings in each category
        const categories = Object.values(Category); // Enum values
        const categoryCounts = await Promise.all(
            categories.map(async (category) => {
                const count = await prisma.serviceListing.count({
                    where: {
                        category: category,
                    },
                });
                return [this.formatStringToLetterCase(category), count];
            })
        );

        // Prepare the result in the desired format
        const serviceListingPieChartData = [["Category", "Count"]]; // Initial row
        serviceListingPieChartData.push(...categoryCounts);

        // new service listing by month
        const sixMonthsAgo = subMonths(new Date(), 6);
        const serviceListings = await prisma.serviceListing.findMany({
            where: {
                dateCreated: {
                    gte: sixMonthsAgo,
                },
            },
        });
        const countsByMonth = {};
        serviceListings.forEach((listing) => {
            const month = format(listing.dateCreated, 'MMM yyyy');
            countsByMonth[month] = (countsByMonth[month] || 0) + 1;
        });
        const result = [
            ["Month", "Count"],
        ];
        const sixMonths = [];
        for (let i = 5; i >= 0; i--) {
            const month = format(subMonths(new Date(), i), 'MMM yyyy');
            sixMonths.push(month);
        }
        for (const month of sixMonths) {
            const count = countsByMonth[month] || 0;
            result.push([month, count]);
        }

        return {
            serviceListingDistribution: serviceListingPieChartData,
            newServiceListingData: result
        }

    } catch (error) {
        console.error("Error generating service listing data:", error);
        throw new Error("Error generating service listing data");
    }
}

exports.formatStringToLetterCase = (enumString) => {
    return enumString
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}