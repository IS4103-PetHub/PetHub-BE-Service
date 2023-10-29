const adminChartService = require("../services/charts/adminChartService")


exports.adminCharts = async (req, res, next) => {
    try {
        const response = await adminChartService.generateAdminCharts();
        res.status(200).json(response)
    } catch(error) {
        next(error)
    }
}

// exports.petBusinessCharts = async (req, res, next) => {
//     try {

//         res.status(200)
//     } catch(error) {
//         next(error)
//     }
// }