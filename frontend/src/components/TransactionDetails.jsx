import React, { memo } from "react";
import PropTypes from "prop-types";
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";

function TransactionDetails({ transaction, isNested = false, isList = false }) {
    const sortedEntries = Object.entries(transaction).sort((a, b) => a[0].localeCompare(b[0]));

    return (
        <div style={isNested ? { marginLeft: "25px" } : {}}>
            {sortedEntries.map(([key, value], index) => {
                const displayKey = isList ? index + 1 : key; // If it's a list, start keys from 1

                if (key === "data") {
                    return (
                        <Accordion key={key} allowMultiple>
                            <AccordionItem border="none">
                                <AccordionButton padding="0" fontSize="var(--chakra-fontSizes-sm)">
                                    data:
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel padding="0 0 0 25px">{value}</AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    );
                }

                if (Array.isArray(value) && value.length === 0) {
                    return <div key={key}>{displayKey}: []</div>;
                }
                if (typeof value === "object" && value !== null && Object.keys(value).length === 0) {
                    return (
                        <div key={key}>
                            {displayKey}: {"{}"}
                        </div>
                    );
                }
                if (typeof value === "object" && value !== null) {
                    return (
                        <Accordion key={key} allowMultiple>
                            <AccordionItem border="none">
                                <AccordionButton padding="0" fontSize="var(--chakra-fontSizes-sm)">
                                    {displayKey}:
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel p={0}>
                                    <TransactionDetails transaction={value} isNested isList={Array.isArray(value)} />
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    );
                }
                return (
                    <div key={key}>
                        {displayKey}: {value === null ? "null" : String(value)}
                    </div>
                );
            })}
        </div>
    );
}

TransactionDetails.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    transaction: PropTypes.any,
    isNested: PropTypes.bool,
    isList: PropTypes.bool,
};

export default memo(TransactionDetails);
