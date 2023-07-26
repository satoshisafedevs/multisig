import React from "react";
import { IconButton, useColorMode } from "@chakra-ui/react";

export default function ThemeSwitcher() {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <IconButton
            background="none"
            margin="10px 10px 0 0"
            aria-label="Color mode"
            onClick={toggleColorMode}
            icon={colorMode === "light" ? <>🌚</> : <>🌝</>}
        />
    );
}
