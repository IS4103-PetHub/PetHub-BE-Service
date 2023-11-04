const { RefundStatus } = require("@prisma/client");
const prisma = require("../../../../prisma/prisma");

exports.getPBDashboardData = async (petBusinessId) => {
    try {

        // Average of orders made this month with % increae or drop as compared to last month -> TBD 


        // number of unreplied reivews?
        const unrepliedReviewCount = await this.getTotalUnrepliedReviews(petBusinessId)

        // count of service listing that requires attention
        const invalidSLCount = await this.getInvalidServiceListings(petBusinessId)

        // refund request
        const openRefundRequestsCount = await this.getOpenRefundRequests(petBusinessId)

        // open support ticket
        const openSupportRequestsCount = await this.getOpenSupportRequests(petBusinessId)

        const pbDashbaordData = {
            unrepliedReviewCount: unrepliedReviewCount,
            invalidSLCount: invalidSLCount,
            openRefundRequestsCount: openRefundRequestsCount,
            openSupportRequestsCount: openSupportRequestsCount
        }

        return pbDashbaordData

    } catch (error) {
        console.error("Error fetching PB dashboard data", error);
        throw new Error("Error fetching PB dashbaord data");
    }
}

exports.getNumberOfOrders = async () => {
    // number of orders / number of days past in the month 
    // compare with last months average and output the % difference
}

exports.getTotalUnrepliedReviews = async (petBusinessId) => {
    try {
        const unrepliedCount = await prisma.review.count({
            where: {
                serviceListing: {
                    petBusinessId: petBusinessId
                },
                reply: null
            }
        });



        return unrepliedCount;
    } catch (error) {
        console.error("Error generating unreplied Review count:", error);
        throw new Error("Error generating unreplied Review count");
    }
}

exports.getInvalidServiceListings = async (petBusinessId) => {
    try {

        const invalidServiceListingCount = await prisma.serviceListing.count({
            where: {
                petBusinessId: petBusinessId,
                OR: [
                    {
                        AND: [
                            { requiresBooking: true },
                            {
                                OR: [
                                    { duration: null },
                                    { calendarGroupId: null }
                                ]
                            }
                        ]
                    },
                    {
                        lastPossibleDate: {
                            lt: new Date()
                        }
                    }
                ]
            }
        });

        return invalidServiceListingCount

    } catch (error) {
        console.error("Error generating invalid Service Listing count:", error);
        throw new Error("Error generating invalid Service Listing count");
    }
}

exports.getOpenRefundRequests = async (petBusinessId) => {
    try {
        const openRefundRequests = await prisma.refundRequest.count({
            where: {
                petBusinessId: petBusinessId,
                status: RefundStatus.PENDING
            }
        })
        return openRefundRequests
    } catch(error) {
        console.error("Error generating open Refund Requests count:", error);
        throw new Error("Error generating open Refund Requests count");
    }
}

exports.getOpenSupportRequests = async (petBusinessId) => {
    try {
        const openSupportRequests = await prisma.supportTicket.count({
            where: {
                petBusinessId: petBusinessId,
                status: {
                    in: ["PENDING", "IN_PROGRESS"]
                }
            }
        });

        return openSupportRequests
    } catch(error) {
        console.error("Error generating open Support Requests count:", error);
        throw new Error("Error generating open Support Requests count");
    }
}