  // WRITE: Create, Update, Delete

const { getUserFromToken } = require("../../utils/nextAuth");
const { getUserPermissions } = require("../services/rbac/rbacService");

  // READ: Read, Read all, Read all by *
  const apiToPermissionMap = {
    // WRITE_INTERNAL_USERS Permission
    "POST /api/users/internal-users": 1,
    "PATCH /api/users/internal-users": 1,
    "DELETE /api/users/internal-users": 1,

    // READ_INTERNAL_USERS Permission
    // Includes Get and GetAll
    "GET /api/users/internal-users": 2,

    // WRITE_PET_OWNERS Permission
    "POST /api/users/pet-owners": 3,
    "PATCH /api/users/pet-owners": 3,
    "DELETE /api/users/pet-owners": 3,

    // READ_PET_OWNERS Permission
    "GET /api/users/pet-owners": 4,

    // WRITE_PET_BUSINESSES Permission
    "POST /api/users/pet-businesses": 5,
    "PATCH /api/users/pet-businesses": 5,
    "DELETE /api/users/pet-businesses": 5,

    // READ_PET_BUSINESSES Permission
    "GET /api/users/pet-businesses": 6,

    // WRITE_RBAC Permission
    "": 7,
    // READ_RBAC Permission
    "": 8,

    // WRITE_TAGS Permission
    "POST /api/tags": 9,
    "PATCH /api/tags": 9,
    "DELETE /api/tags": 9,

    // READ_TAGS Permission
    "GET /api/tags": 10,

    // WRITE_PET_BUSINESS_APPLICATIONS Permission
    "": 11,
    // READ_PET_BUSINESS_APPLICATIONS Permission
    "": 12,
    // WRITE_SERVICE_LISTINGS Permission
    "": 13,
    // READ_SERVICE_LISTINGS Permission
    "": 14,
  };

  // Slices off id parameters
  function getBaseUrl(url) {
    switch (true) {
      case url.includes("/api/users/internal-users"):
        return "/api/users/internal-users";
      case url.includes("/api/users/pet-businesses"):
        return "/api/users/pet-businesses";
      case url.includes("/api/users/pet-owners"):
        return "/api/users/pet-owners";
      case url.includes("/api/tags"):
        return "/api/tags";
      default:
        return "PASS";
    }
  }

  module.exports = async function authorizationChecker(req, res, next) {
    try {
      const baseUrl = getBaseUrl(req.url);
      if (baseUrl === "PASS") {
        next();
      } else {
        const urlKey = req.method + " " + baseUrl;
        const permissionRequiredForURL = apiToPermissionMap[urlKey];

        const authHeader = req.headers['authorization'];
        if (!authHeader) {
          // Good practice, but for testing, we will skip if token is missing so that devs do not need to attach a token to test APIs
          // return res.status(401).json({ error: 'Token missing' });
          next();
        }
        const token = authHeader.split(' ')[1];
        const user = await getUserFromToken(token);
        const permissions = await getUserPermissions(user.userId);
        const permissionIds = permissions.map(p => p.permissionId);

        if (permissionIds.includes(permissionRequiredForURL)) {
          next();
        } else {
          return res.status(403).json({  error: "Forbidden. You do not have permission to do this action. Please check with the root administrator to grant you access for this action.",
            });
        }
      }
    } catch (error) {
      console.error("Token validation error:", error);
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
