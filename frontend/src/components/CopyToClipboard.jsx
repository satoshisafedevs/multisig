import React, { useState, memo } from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip, useStyleConfig } from "@chakra-ui/react";
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";

function CopyToClipboard({ copy, tooltipSuffix, size }) {
    const suffix = tooltipSuffix ? ` ${tooltipSuffix}` : "";
    const [tooltipLabel, setTooltipLabel] = useState(`Copy${suffix}`);
    const [icon, setIcon] = useState(<IoCopyOutline />);
    const buttonStyles = useStyleConfig("Button");

    const copyAction = async () => {
        try {
            setTooltipLabel("Copied!");
            setIcon(<IoCheckmarkOutline />);
            await navigator.clipboard.writeText(copy);
            setTimeout(() => {
                setTooltipLabel(`Copy${suffix}`);
                setIcon(<IoCopyOutline />);
            }, 1000);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Failed to copy: ", err);
        }
    };

    return (
        <Tooltip label={tooltipLabel}>
            <IconButton
                // eslint-disable-next-line no-underscore-dangle
                _hover={{ ...buttonStyles._hover, cursor: "pointer" }}
                maxHeight={size}
                minWidth={size}
                as="span"
                size="sm"
                aria-label="Copy icon"
                variant="ghost"
                colorScheme="blueSwatch"
                icon={icon}
                onClick={(event) => {
                    event.preventDefault();
                    copyAction();
                }}
            />
        </Tooltip>
    );
}

CopyToClipboard.propTypes = {
    copy: PropTypes.string.isRequired,
    tooltipSuffix: PropTypes.string,
    size: PropTypes.string,
};

export default memo(CopyToClipboard);
