export const formatPhoneNumber = (phoneNumber) => {
    // Use regular expression to match and capture the groups of digits
    const match = phoneNumber.match(/^(\d{3})?(\d{3})?(\d{4})?$/);
    if (match && match[0] !== "") {
        // If the phone number is in a valid format, return it in the format (888) 888 - 8888
        return `(${match[1] || ""}) ${match[2] || ""} - ${match[3] || ""}`;
    }
    // If the phone number is not in a valid format, return it as is
    return phoneNumber;
};

export const extractNumbers = (string) => {
    // Use regular expression to match and capture all the digits in the string
    const match = string.match(/\d+/g);
    if (match) {
        // If there are any numbers in the string, return them as a new string
        return match.join("");
    }
    // If there are no numbers in the string, return an empty string
    return "";
};
