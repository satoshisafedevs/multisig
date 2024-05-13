import { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";

function LastReply({ message }) {
    const [formattedTime, setFormattedTime] = useState("");

    // This function will determine the interval timing based on whole minutes
    function getDynamicInterval(differenceInMinutes) {
        if (differenceInMinutes < 60) {
            return 60000; // 1 minute
        }
        if (differenceInMinutes < 1440) {
            // 1440 minutes in a day
            return 3600000; // 1 hour
        }
        return 86400000; // 1 day
    }

    function calculateDifferenceInMonthsAndYears(startDate, endDate) {
        // Get the year and month difference directly
        let totalMonths =
            (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

        // Adjust the month count if the day of the end date is less than that of the start date
        if (endDate.getDate() < startDate.getDate()) {
            totalMonths -= 1;
        }

        // Determine the exact number of years and remaining months
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        return { years, months };
    }

    function formatFirebaseTime(firebaseTime) {
        const { seconds, nanoseconds } = firebaseTime;
        const firebaseTimestamp = new Date(seconds * 1000 + Math.floor(nanoseconds / 1000000));
        const now = new Date();

        // Calculate the difference in various time units
        const differenceInMs = now - firebaseTimestamp;
        const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
        const differenceInHours = Math.floor(differenceInMs / (1000 * 60 * 60));
        const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
        const differenceInWeeks = Math.floor(differenceInDays / 7);

        // Calculate the exact difference in years and months
        const { years, months } = calculateDifferenceInMonthsAndYears(firebaseTimestamp, now);

        // Conditional statements to handle each time unit appropriately
        if (differenceInMinutes < 1) {
            return "just now";
        }
        if (differenceInMinutes < 60) {
            return differenceInMinutes === 1 ? "1 minute ago" : `${differenceInMinutes} minutes ago`;
        }
        if (differenceInHours < 24) {
            return differenceInHours === 1 ? "1 hour ago" : `${differenceInHours} hours ago`;
        }
        if (differenceInDays < 7) {
            return differenceInDays === 1 ? "1 day ago" : `${differenceInDays} days ago`;
        }
        if (differenceInWeeks < 4) {
            return differenceInWeeks === 1 ? "1 week ago" : `${differenceInWeeks} weeks ago`;
        }
        if (years > 0) {
            return years === 1 ? "1 year ago" : `${years} years ago`;
        }
        if (months > 0) {
            return months === 1 ? "1 month ago" : `${months} months ago`;
        }

        // Catch-all fallback message
        return "a long time ago";
    }

    useEffect(() => {
        if (message.threadLastReply) {
            let interval;

            const updateTime = () => {
                const formatted = formatFirebaseTime(message.threadLastReply);
                setFormattedTime(formatted);

                // Calculate the difference in minutes, ignoring seconds and milliseconds
                const { seconds } = message.threadLastReply;
                const firebaseTimestamp = new Date(seconds * 1000);
                const now = new Date();
                const differenceInMs = now - firebaseTimestamp;
                const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));

                // Get the interval timing dynamically for the next tick
                const intervalTime = getDynamicInterval(differenceInMinutes);

                // Clear and restart the interval
                clearInterval(interval);
                interval = setInterval(updateTime, intervalTime);
            };

            // Initial update
            updateTime();

            const handleVisibilityChange = () => {
                if (!document.hidden) {
                    updateTime();
                }
            };

            document.addEventListener("visibilitychange", handleVisibilityChange);

            // Cleanup interval on component unmount
            return () => {
                clearInterval(interval);
                document.removeEventListener("visibilitychange", handleVisibilityChange);
            };
        }
    }, [message.threadLastReply]);

    return `Last reply ${formattedTime}`;
}

LastReply.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    message: PropTypes.any,
};

export default memo(LastReply);
