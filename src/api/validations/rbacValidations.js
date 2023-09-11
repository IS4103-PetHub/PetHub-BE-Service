// TODO: import baseValidations after wenxin merges code
const isValidNumericID = (id) => {
    return typeof id === 'number' && id > 0;
};

exports.isValidUserGroupPayload = (payload) => {
    // Ensure payload is an object and not null
    if (typeof payload !== 'object' || payload === null) {
        return false;
    }

    const hasValidName = typeof payload.name === 'string' && payload.name.trim() !== '';
    const hasValidPermissionIds = Array.isArray(payload.permissionIds) &&
        payload.permissionIds.every(id => isValidNumericID(id));
    // Return true only if both name and permissionIds are valid
    return hasValidName && hasValidPermissionIds;
}


exports.isValidUpdateUserGroupPayload = (payload) => {
    // Ensure payload is an object and not null
    if (typeof payload !== 'object' || payload === null) {
        return false;
    }

    const hasValidName = payload.name && typeof payload.name === 'string' && payload.name.trim() !== '';
    const hasValidDescription = payload.description && typeof payload.description === 'string' && payload.description.trim() !== '';

    // Return true if there's either a valid name, a valid description, or both
    return hasValidName || hasValidDescription;
}
