exports.isValidUserGroupPayload = (payload) => {
    // Ensure payload is an object and not null
    if (typeof payload !== 'object' || payload === null) {
        return false;
    }

    const hasValidName = payload.name && typeof payload.name === 'string' && payload.name.trim() !== '';
    const hasValidDescription = payload.description && typeof payload.description === 'string' && payload.description.trim() !== '';

    // Return true only if both name and description are valid
    return hasValidName && hasValidDescription;
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
