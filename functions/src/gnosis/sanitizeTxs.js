const convertNestedArrays = (obj) => {
    if (Array.isArray(obj)) {
        // Check if it's an array of arrays
        if (obj.every((item) => Array.isArray(item))) {
            return obj.map((subArray, index) => ({
                [index]: convertNestedArrays(subArray),
            }));
        }
        return obj.map((item) => {
            if (typeof item === "object" && item !== null) {
                // If the item is an object or array, recursively check its properties or elements
                return convertNestedArrays(item);
            }
            return item;
        });
    }
    if (typeof obj === "object" && obj !== null) {
        // Create a copy of obj to avoid modification of function parameters
        const newObj = { ...obj };
        Object.keys(newObj).forEach((key) => {
            if (typeof newObj[key] === "object" && newObj[key] !== null) {
                newObj[key] = convertNestedArrays(newObj[key]);
            }
        });
        return newObj; // Return the new object
    }
    return obj;
};

module.exports = {
    convertNestedArrays,
};
