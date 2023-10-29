const prisma = require('../../../../prisma/prisma');

class AdminChartService {

    async generateAdminCharts() {
        try {

            let chartPayload = {}

            chartPayload.petBusinessServiceListingChart = await this.petBusinessServiceListingChart();
            chartPayload.petOwnerDemographicChart = await this.petOwnerDemographicChart();

            return chartPayload

        } catch (error) {
            throw error
        }
    }

    async petBusinessServiceListingChart() {
        try {
            const petBusinesses = await prisma.petBusiness.findMany({
                include: {
                    serviceListings: true
                }
            });
            const chartData = [['Category', 'Count']];
            for (const petBusiness of petBusinesses) {
                const { companyName, serviceListings } = petBusiness;
                chartData.push([companyName, serviceListings.length]);
            }
            chartData.sort((a, b) => b[1] - a[1]);
            return chartData;
        } catch (error) {
            throw error
        }
    }

    async petOwnerDemographicChart() {
        try{
            const petOwners = await prisma.petOwner.findMany()
            const ageDistribution = {};
            const currentDate = new Date();
            for (const petOwner of petOwners) {
                const birthDate = new Date(petOwner.dateOfBirth);
                const age = currentDate.getFullYear() - birthDate.getFullYear();
                if (age in ageDistribution) {
                    ageDistribution[age]++;
                } else {
                    ageDistribution[age] = 1;
                }
            }
            const chartData = [['Age', 'Count']];
            for (const age in ageDistribution) {
                chartData.push([age, ageDistribution[age]]);
            }

            return chartData;

        } catch (error) {
            throw error
        }
    }

}

module.exports = new AdminChartService();