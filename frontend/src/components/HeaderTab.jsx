import React from "react";
import { Button } from "@chakra-ui/react";
import PropTypes from "prop-types";

function HeaderTab({ isActive, onClick, children }) {
    return (
        <Button
            variant="ghost"
            size="sm"
            fontWeight={isActive ? "bold" : "normal"}
            minWidth="34px"
            onClick={() => onClick("chart")}
            colorScheme="blueSwatch"
        >
            {children}
        </Button>
    );
}

HeaderTab.propTypes = {
    isActive: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default HeaderTab;
