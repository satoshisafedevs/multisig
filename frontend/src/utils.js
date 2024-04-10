import { ethers } from "ethers";

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
        // return Number((num < 0 ? -1 : 1) * Number(absNum.toFixed(4)));
        const numStr = absNum.toString();
        const firstNonZeroIndex = numStr.indexOf(numStr.match(/[1-9]/)?.[0]);
        const endIndex = firstNonZeroIndex + 4;
        // Construct the number string with up to 4 significant figures without rounding
        const resultStr = numStr.substring(0, endIndex);
        // Convert the string back to number, preserving the sign of the original input
        return (num < 0 ? -1 : 1) * parseFloat(resultStr);
    }
    // Otherwise round to 2 decimal places
    return Intl.NumberFormat("en-US", { style: "decimal" }).format(
        ((num < 0 ? -1 : 1) * Math.floor(absNum * 100)) / 100,
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

export const convertToISOString = (timestamp) => {
    // Convert seconds to milliseconds since JavaScript Date object uses milliseconds
    const date = new Date(timestamp.seconds * 1000);

    // Adjust for nanoseconds
    // In JavaScript, there's no direct nanosecond support. So we'll convert nanoseconds to milliseconds first
    // and adjust the date accordingly. This might not always be super precise because of JavaScript's
    // limitation but for the given format, it should work well.
    const millisecondsFromNanoseconds = timestamp.nanoseconds / 1000000;
    date.setMilliseconds(date.getMilliseconds() + millisecondsFromNanoseconds);

    return date.toISOString();
};

export const toHumanReadable = (value, decimals) => {
    // Use the BigNumber utility from ethers.js
    const bigNumberValue = ethers.BigNumber.from(value);
    // Divide by 10 to the power of decimals to get the human-readable number
    const humanReadable = ethers.utils.formatUnits(bigNumberValue, decimals);
    return humanReadable;
};

export const fromHumanReadable = (value, decimals) => {
    // Convert the value to a string to ensure proper decimal handling
    let valueStr = value.toString();

    // Check if value is in exponential format and convert it to a fixed decimal string
    if (valueStr.includes("e")) {
        const valueNum = Number(valueStr);
        valueStr = valueNum.toFixed(decimals);
    }

    // Use ethers.js to parse the value string with the specified decimals
    // This effectively multiplies the human-readable value by 10**decimals to get the smallest unit
    const formattedValue = ethers.utils.parseUnits(valueStr, decimals);

    return formattedValue.toString();
};

// Compress the image to approximately 1MB
export const compressImageTo1MB = (blob, callback, maxWidth = 800, maxHeight = 800, targetQuality = 0.9) => {
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let { width } = img;
        let { height } = img;

        if (width > height) {
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } else if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compress = (quality) => {
            canvas.toBlob(
                (compressedImageBlob) => {
                    if (compressedImageBlob.size < 1024 * 1024 || quality <= 0.1) {
                        callback(compressedImageBlob);
                    } else {
                        compress(quality - 0.05);
                    }
                },
                "image/jpeg",
                quality,
            );
        };

        compress(targetQuality);
    };
};

// Function to remove a key object
export const filterOutKeyObject = (obj, keyToRemove) =>
    Object.entries(obj).reduce((acc, [key, value]) => {
        if (key !== keyToRemove) {
            acc[key] = value;
        }
        return acc;
    }, {});

/* eslint-disable */
export const isValidEmail = (email) => {
    const regex = new RegExp(
        '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|' +
            '(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|' +
            "(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))",
    );
    return regex.test(String(email).toLowerCase());
};
/* eslint-enable */
