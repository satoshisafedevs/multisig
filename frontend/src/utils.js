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

export const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export const formatNumber = (num, price = false) => {
    if (price) {
        if (num !== 0 && num < 1) {
            return `$${Number(num.toPrecision(4))}`;
        }
        // Otherwise round to 2 decimal places
        return usdFormatter.format((Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2));
    }

    const absNum = Math.abs(num);
    // If number is less than 1 and not 0, round to 4 significant figures
    if (absNum !== 0 && absNum < 1) {
        return Number((num < 0 ? -1 : 1) * absNum.toPrecision(4));
    }
    // Otherwise round to 2 decimal places
    return Intl.NumberFormat("en-US", { style: "decimal" }).format(
        ((num < 0 ? -1 : 1) * Math.round((absNum + Number.EPSILON) * 100)) / 100,
    );
};

export const formatTimestamp = (timestamp) => {
    // Create a new Date object using the total milliseconds
    const totalMilliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;
    const date = new Date(totalMilliseconds);

    // Extract the components of the date
    const year = date.getFullYear();
    const day = date.getDate();

    // Extract the hour and decide the meridiem (AM/PM) and adjust hour for 12-hour format
    let hour = date.getHours();
    const meridiem = hour < 12 ? "AM" : "PM";
    hour %= 12;
    hour = hour || 12; // the hour '0' should be '12'

    // Minutes and seconds are extracted, and we ensure it's two-digit, e.g., '05' not '5'
    const minutes = `0${date.getMinutes()}`.slice(-2);
    const seconds = `0${date.getSeconds()}`.slice(-2);

    // Months are 0-based in JavaScript (0 = January), so we need an array of month names
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const month = months[date.getMonth()];

    // Construct the formatted date string
    const formattedDate = `${month} ${day}, ${year} ${hour}:${minutes}:${seconds} ${meridiem}`;

    return formattedDate;
};
